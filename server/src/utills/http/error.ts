import { MSG } from "../../constants";

export function handleServerError(res:any,error:any,path:any){
            console.error(path, error);
    
            return res.status(500).json({
                error: MSG.SERVER_ERROR
            })
}