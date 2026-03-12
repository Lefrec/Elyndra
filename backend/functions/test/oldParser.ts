// //parse the [TOOL_CALLS] request, should be able to handle multiple call in a single request
// function parseToolCalls(request : string): Array<{ name: string; args: any }> | null {
//     console.log("[parseToolCalls] Parsing request looking for tool call")
//     const TAG : string = "[TOOL_CALLS]";
//     const toolCalls : Array<{ name: string; args: any }> = [];
    
//     if (!request.includes(TAG)) {
//         console.log("[parseToolCalls] No tool call found in request")
//         return null;
//     }

//     //split the request into different sections delimited by the TAG, filter removes empty values
//     const splittedRequests : Array<string> = request.split(TAG).filter(d => d);
//     console.log("[parseToolCalls] Found",splittedRequests.length,"tool call in request")

//     //for each call, get the name of the function called and the arguments
//     splittedRequests.forEach(call => {
//         const nameMatch = call.match(/^([a-zA-Z0-9_]+)/);
//         if (!nameMatch) return null;
//         const name = nameMatch[1];

//         const argsJSON = call.slice(name.length);
//         const args = checkValidJSON(argsJSON) ? JSON.parse(argsJSON) : {};

//         toolCalls.push({ name, args });
//         console.log("[parseToolCalls] Added a call for",name,"to the list of toolCalls")
//     });

//     return toolCalls;
// }

// //simple helper function that check if a string is valid JSON format
// function checkValidJSON(string : string) {
//     try {
//         JSON.parse(string);
//     } catch (e) {
//         return false;
//     }
//     return true;
// }