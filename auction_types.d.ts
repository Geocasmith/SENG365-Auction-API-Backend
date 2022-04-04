type Auction = {
    id:number;
    title:string;
    description:string;
    end_date:string;
    image_filename:string;
    reserve:number;
    seller_id:number;
    category_id:number;
}

type Bid = {
    id:number;
    auction_id:number;
    user_id:number;
    amount:number;
    timestamp:string;
}
type Category = {
    categoryId:number;
    name:string;
}