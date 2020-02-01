export class PurchaseReportRequest{
    Id:number;
    orderCode:string;
    productTitle:string;
    paymentBy:Array<string>;
    type:string;
    paymentStartDate:Date;
    paymentEndDate:Date;
    debtAmount:boolean;
}


export class PurchaseReportMercariRequest{
    Id:number;
}