import mongoose from 'mongoose'
import { ActivityLog, InventoryItem, Purchase, StockAdjustment, StockUsage, Supplier } from '../models/BusinessModels.js'
import { operationalShift } from '../services/shiftService.js'
const fail = (res, message) => res.status(400).json({ message })
const isId = value => mongoose.isValidObjectId(value)
const number = value => Number(value)
const units = ['Kg','Piece','Bag','Liter']
const itemFields = body => ({ itemName:body.itemName?.trim(), category:body.category?.trim(), unit:body.unit?.trim(), lowStockThreshold:number(body.lowStockThreshold || 0), imageUrl:body.imageUrl?.trim(), isActive:body.isActive !== false })
const activity = (data, actor) => ActivityLog.create({ ...data, actor })
export async function listItems(req,res,next){try{const {search='',status='',lowStock='',page=1,limit=20}=req.query;const filter={};if(search)filter.$or=[{itemName:new RegExp(search,'i')},{category:new RegExp(search,'i')}];if(status==='active')filter.isActive=true;if(status==='inactive')filter.isActive=false;if(lowStock==='true')filter.$expr={$lte:['$quantity','$lowStockThreshold']};const [items,total]=await Promise.all([InventoryItem.find(filter).sort({updatedAt:-1}).skip((Number(page)-1)*Number(limit)).limit(Number(limit)).lean(),InventoryItem.countDocuments(filter)]);
// Cashiers see stock levels and selling price (needed to book orders) but never purchase cost — that's owner-level margin data.
const visible=req.auth.role==='ADMIN'?items:items.map(item=>item.goatDetails?{...item,goatDetails:{...item.goatDetails,purchasePrice:undefined}}:item)
res.json({items:visible,total,page:Number(page),limit:Number(limit)})}catch(error){next(error)}}
export async function createItem(req,res,next){try{const values=itemFields(req.body);if(!values.itemName||!values.category||!values.unit)return fail(res,'Item Name, Category, and Unit are required.');if(!units.includes(values.unit))return fail(res,'Unit must be Kg, Piece, Bag, or Liter.');if(!Number.isFinite(values.lowStockThreshold)||values.lowStockThreshold<0)return fail(res,'Low Stock Threshold must be zero or greater.');const item=await InventoryItem.create({...values,quantity:0});await activity({module:'Inventory',action:'Item created',description:`${item.itemId} · ${item.itemName} was added to inventory.`},req.auth.sub);res.status(201).json({item})}catch(error){next(error)}}
export async function updateItem(req,res,next){try{if(!isId(req.params.id))return fail(res,'Invalid inventory item.');const values=itemFields(req.body);if(!values.itemName||!values.category||!values.unit)return fail(res,'Item Name, Category, and Unit are required.');if(!units.includes(values.unit))return fail(res,'Unit must be Kg, Piece, Bag, or Liter.');const item=await InventoryItem.findByIdAndUpdate(req.params.id,values,{new:true,runValidators:true});if(!item)return res.status(404).json({message:'Inventory item not found.'});await activity({module:'Inventory',action:'Item updated',description:`${item.itemId} · ${item.itemName} inventory details were updated.`},req.auth.sub);res.json({item})}catch(error){next(error)}}
export async function removeItem(req,res,next){try{if(!isId(req.params.id))return fail(res,'Invalid inventory item.');const item=await InventoryItem.findByIdAndUpdate(req.params.id,{isActive:false},{new:true});if(!item)return res.status(404).json({message:'Inventory item not found.'});await activity({module:'Inventory',action:'Item deactivated',description:`${item.itemName} was deactivated.`},req.auth.sub);res.status(204).end()}catch(error){next(error)}}
export async function createPurchase(req,res,next){try{const {date,item,quantityPieces,quantityKg,supplier,invoiceNo,notes,totalPrice:bodyTotalPrice}=req.body;const isCashier=req.auth.role==='CASHIER';
  const pieces=Number.isFinite(number(quantityPieces))&&number(quantityPieces)>0?number(quantityPieces):undefined;
  const kg=Number.isFinite(number(quantityKg))&&number(quantityKg)>0?number(quantityKg):undefined;
  // Both quantity units are optional individually — at least one must be provided.
  if(!date||!isId(item)||!isId(supplier)||(pieces===undefined&&kg===undefined))return fail(res,'Date, Item, Supplier, and at least one of Quantity (Pieces) or Quantity (KG) are required.');
  const totalPrice=number(bodyTotalPrice);
  if(!(Number.isFinite(totalPrice)&&totalPrice>0))return fail(res,'Purchase Price / Total Amount is required.');
  // Cashiers can only record incoming stock while they have a valid, active
  // shift — enforced here, not just in the UI. Once their scheduled window
  // ends this fails the same way order/payment creation already does.
  let shift=null
  if(isCashier){shift=await operationalShift(req.auth.sub);if(!shift)return fail(res,'You need an open shift within your assigned schedule window before recording incoming stock.')}
  const [stockItem,supplierProfile]=await Promise.all([InventoryItem.findById(item),Supplier.findById(supplier)]);
  if(!stockItem)return res.status(404).json({message:'Inventory item not found.'});
  if(!supplierProfile)return res.status(404).json({message:'Supplier not found.'});
  const purchase=await Purchase.create({date,item,quantityPieces:pieces,quantityKg:kg,totalPrice,supplier,invoiceNo:invoiceNo?.trim(),notes:notes?.trim(),createdBy:req.auth.sub,shift:shift?._id});
  // stockPieces/stockKg are additive running totals shown in the inventory
  // list. The legacy quantity/unit pair stays the single number the rest of
  // the app (low-stock alerts, order availability) already relies on — it
  // increments by whichever of pieces/kg matches this item's own unit, so
  // nothing else in the system needs to change.
  if(pieces!==undefined)stockItem.stockPieces+=pieces
  if(kg!==undefined)stockItem.stockKg+=kg
  if(stockItem.unit==='Piece'&&pieces!==undefined)stockItem.quantity+=pieces
  else if(stockItem.unit==='Kg'&&kg!==undefined)stockItem.quantity+=kg
  else stockItem.quantity+=(pieces||0)+(kg||0)
  supplierProfile.outstandingBalance+=totalPrice;
  await Promise.all([stockItem.save(),supplierProfile.save()]);
  const parts=[pieces!==undefined?`${pieces} pcs`:null,kg!==undefined?`${kg} kg`:null].filter(Boolean).join(', ');
  await activity({module:'Inventory',action:'Purchase entry',description:`${parts} added to ${stockItem.itemName}.`,amount:totalPrice},req.auth.sub);
  res.status(201).json({purchase,inventoryItem:stockItem})
}catch(error){next(error)}}
export async function createUsage(req,res,next){try{const {date,item,quantityUsed,purpose,remarks}=req.body;if(!date||!isId(item)||!purpose||!Number.isFinite(number(quantityUsed))||number(quantityUsed)<=0)return fail(res,'Date, Item, Quantity Used, and Purpose are required.');const stockItem=await InventoryItem.findById(item);if(!stockItem)return res.status(404).json({message:'Inventory item not found.'});if(stockItem.quantity<number(quantityUsed))return fail(res,'Quantity Used cannot exceed current stock.');const usage=await StockUsage.create({date,item,quantityUsed:number(quantityUsed),purpose:purpose.trim(),remarks:remarks?.trim(),createdBy:req.auth.sub});stockItem.quantity-=number(quantityUsed);await stockItem.save();await activity({module:'Inventory',action:'Stock usage',description:`${quantityUsed} ${stockItem.unit} used from ${stockItem.itemName}.`},req.auth.sub);res.status(201).json({usage,inventoryItem:stockItem})}catch(error){next(error)}}
export async function createAdjustment(req,res,next){try{const {date,item,adjustmentType,quantity,reason}=req.body;if(!date||!isId(item)||!['Increase','Decrease'].includes(adjustmentType)||!reason||!Number.isFinite(number(quantity))||number(quantity)<=0)return fail(res,'Date, Item, adjustment type, Quantity, and Reason are required.');const stockItem=await InventoryItem.findById(item);if(!stockItem)return res.status(404).json({message:'Inventory item not found.'});if(adjustmentType==='Decrease'&&stockItem.quantity<number(quantity))return fail(res,'Decrease quantity cannot exceed current stock.');const adjustedQuantity=adjustmentType==='Increase'?number(quantity):-number(quantity);const adjustment=await StockAdjustment.create({date,item,adjustmentType,quantity:number(quantity),reason:reason.trim(),createdBy:req.auth.sub});stockItem.quantity+=adjustedQuantity;await stockItem.save();await activity({module:'Inventory',action:'Stock adjustment',description:`${adjustmentType} of ${quantity} ${stockItem.unit} for ${stockItem.itemName}.`},req.auth.sub);res.status(201).json({adjustment,inventoryItem:stockItem})}catch(error){next(error)}}
export async function history(req,res,next){try{if(!isId(req.params.id))return fail(res,'Invalid inventory item.');const [purchases,usages,adjustments]=await Promise.all([Purchase.find({item:req.params.id}).sort({date:-1}).lean(),StockUsage.find({item:req.params.id}).sort({date:-1}).lean(),StockAdjustment.find({item:req.params.id}).sort({date:-1}).lean()]);res.json({history:[...purchases.map(x=>({...x,type:'Stock In',quantityPieces:x.quantityPieces,quantityKg:x.quantityKg,quantity:x.quantity??((x.quantityPieces||0)+(x.quantityKg||0)||undefined)})),...usages.map(x=>({...x,type:'Stock Out',quantity:x.quantityUsed})),...adjustments.map(x=>({...x,type:`Adjustment: ${x.adjustmentType}`,quantity:x.quantity}))].sort((a,b)=>new Date(b.date)-new Date(a.date))})}catch(error){next(error)}}
