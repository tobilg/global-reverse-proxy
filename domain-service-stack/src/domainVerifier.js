// For event format, see https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html#http-api-develop-integrations-lambda.proxy-format

const allowedDomains = [
  'mydomain.com',
  'myotherdomain.com'
];

exports.handler = async (event) => {
  let statusCode;

  // Check if there's a "domain" query string paramenter, and check if the give value is in the list of allowed domains
  if (event.queryStringParameters.hasOwnProperty('domain') && allowedDomains.includes(event.queryStringParameters.domain)) {
    // If yes, send a 200 status, which will then trigger a certificate generation in Caddy
    statusCode = 200;
  } else {
    // If not, send a 400 status, which will NOT trigger a certificate generation in Caddy (we should only do this for whitelisted domains!)
    statusCode = 400;
  }

  return {
    statusCode,
  };
};
