/*eslint-disable*/
import mongoose from "mongoose";
const db_url = process.env.DB_URL as string;
let isConnected: boolean = false;
export const connectDb = async () => {
    if (isConnected) return;
    try {
const db = await mongoose.connect(db_url);
isConnected = !!db.connections[0].readyState;
console.log("Conectado a la base de datos."); 
    } catch (err: any) {
        console.error("Error al conectarse a la base de datos: "+err);
        throw err;
    }
} 