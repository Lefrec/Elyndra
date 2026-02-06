import Pocketbase from "pocketbase";
const pb = new Pocketbase("http://127.0.0.1:8090/");

//connecting as Lefrec user
export async function connectToLefrec(){
    try {
        console.log("[connectToLefrec] Connecting to Lefrec");
        const authData = await pb.collection("users").authWithPassword('blackfox244@gmail.com', 'totototototo');
        return authData;
    } catch (error) {
        console.log("[connectToLefrec] Failed to connect to Lefrec: " + error);
        throw error;
    }
}
