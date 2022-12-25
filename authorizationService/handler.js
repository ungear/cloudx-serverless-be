module.exports.basicAuthorizer = function(event, context, callback) {
  try{
    const authHeader = event.headers.authorization;
    const authToken = authHeader.split(' ')[1];
    const buff = Buffer.from(authToken, 'base64');
    const decodedCreds = buff.toString('utf-8').split(':');
    const login = decodedCreds[0];
    const password = decodedCreds[1];
    console.log('Received creds: ',login, password)

    const storedPassword = process.env[login];
    const effect = !!storedPassword && storedPassword === password
      ? 'Allow'
      : 'Deny'

    const policy = generatePolicy(authToken, event.routeArn, effect)
    console.log('Generated policy: ', policy)

    callback(null, policy)
  } catch(e) {
    callback('Unauthorized')
  }
};

function generatePolicy(principalId, resource, effect){
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    }
  }
}
