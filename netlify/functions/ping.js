exports.handler = async function(event, context) {
    console.log("Ping JS function invoked!");
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Pong from JS function!" })
    };
};