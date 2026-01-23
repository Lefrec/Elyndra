const request = `aergaeraeh[TOOL_CALLS]firstCall{"name": "value"}[TOOL_CALLS]otherCall{"amount": 65}[TOOL_CALLS]complexCall{"name": "sword","desc": "a very big chunky sword","amount": 2}`;
const TAG = "[TOOL_CALLS]";

console.log(parseToolCalls(request));

function parseToolCalls(request) {
    console.log("[parseToolCalls] Parsing request looking for tool call")
    const TAG = "[TOOL_CALLS]";
    const toolCalls = [];
    
    if (!request.includes(TAG)) {
        console.log("[parseToolCalls] No tool call found in request")
        return null;
    }

    //split the request into different sections delimited by the TAG, filter removes empty values
    const splittedRequests = request.split(TAG).filter(d => d);
    console.log("[parseToolCalls] Found",splittedRequests.length,"tool call in request")

    //for each call, get the name of the function called and the arguments
    splittedRequests.forEach(call => {
        const name = call.match(/^([a-zA-Z0-9_]+)/)[1];
        if (!name) return null;
        const argsJSON = call.slice(name.length);
        const args = checkValidJSON(argsJSON) ? JSON.parse(argsJSON) : {};
        toolCalls.push({ name, args });
        console.log("[parseToolCalls] Added a call for",name,"to the list of toolCalls")
    });

    return toolCalls;
}

function checkValidJSON(string) {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
    return true;
}