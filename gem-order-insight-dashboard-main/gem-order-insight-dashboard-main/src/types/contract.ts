
export interface Contract {
  contractNumber: string;
  contractStatus: string;
  contractDate: string;
  procurementType: string;
  contractValue: number;
  brand: string;
  bidNumber?: string; // Optional bid number for contracts from bids
  buyer: {
    buyerName: string;
    buyerEmail: string;
    buyerContactNumber: string;
    buyerAddress: string;
    organizationName: string;
    ministry?: string;
    department?: string;
  };
  seller: string | {
    sellerName: string;
    sellerEmail: string;
    sellerContactNumber: string;
    sellerAddress: string;
    sellerGSTNumber: string;
    sellerVerifiedStatus: string;
  };
  consignee: {
    consigneeName: string;
    consigneeEmail: string;
    consigneeContactNumber: string;
    consigneeAddress: string;
  };
  product: {
    productName: string;
    productModel: string;
    quantity: number;
    unitPrice: number;
    totalOrderValue: number;
    categoryName: string;
    catalogueStatus: string;
  };
}
