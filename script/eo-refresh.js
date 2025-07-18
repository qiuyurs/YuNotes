// 项目构建后，刷新eo的cdn缓存

const https = require("https")
const crypto = require("crypto")

function sha256(message, secret = "", encoding) {
  const hmac = crypto.createHmac("sha256", secret)
  return hmac.update(message).digest(encoding)
}
function getHash(message, encoding = "hex") {
  const hash = crypto.createHash("sha256")
  return hash.update(message).digest(encoding)
}
function getDate(timestamp) {
  const date = new Date(timestamp * 1000)
  const year = date.getUTCFullYear()
  const month = ("0" + (date.getUTCMonth() + 1)).slice(-2)
  const day = ("0" + date.getUTCDate()).slice(-2)
  return `${year}-${month}-${day}`
}

// 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
    // 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性
    // 以下代码示例仅供参考，建议采用更安全的方式来使用密钥
    // 请参见：https://cloud.tencent.com/document/product/1278/85305
    // 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
if (!process.env.TENCENTCLOUD_SECRET_ID || !process.env.TENCENTCLOUD_SECRET_KEY) {
  console.error('Missing required environment variables: TENCENTCLOUD_SECRET_ID and TENCENTCLOUD_SECRET_KEY');
  process.exit(1);
}

const SECRET_ID = process.env.TENCENTCLOUD_SECRET_ID;
const SECRET_KEY = process.env.TENCENTCLOUD_SECRET_KEY;
const TOKEN = "";

const host = "teo.tencentcloudapi.com"
const service = "teo"
const region = ""
const action = "CreatePurgeTask"
const version = "2022-09-01"
const timestamp = parseInt(String(new Date().getTime() / 1000))
const date = getDate(timestamp)
const payload = "{\"ZoneId\":\"zone-3e6q22fgevt6\",\"Type\":\"purge_host\",\"Method\":\"invalidate\",\"Targets\":[\"coze.lyzhan.cn\"]}"

// ************* 步骤 1：拼接规范请求串 *************
const signedHeaders = "content-type;host"
const hashedRequestPayload = getHash(payload)
const httpRequestMethod = "POST"
const canonicalUri = "/"
const canonicalQueryString = ""
const canonicalHeaders =
  "content-type:application/json; charset=utf-8\n" + "host:" + host + "\n"

const canonicalRequest =
  httpRequestMethod +
  "\n" +
  canonicalUri +
  "\n" +
  canonicalQueryString +
  "\n" +
  canonicalHeaders +
  "\n" +
  signedHeaders +
  "\n" +
  hashedRequestPayload

// ************* 步骤 2：拼接待签名字符串 *************
const algorithm = "TC3-HMAC-SHA256"
const hashedCanonicalRequest = getHash(canonicalRequest)
const credentialScope = date + "/" + service + "/" + "tc3_request"
const stringToSign =
  algorithm +
  "\n" +
  timestamp +
  "\n" +
  credentialScope +
  "\n" +
  hashedCanonicalRequest

// ************* 步骤 3：计算签名 *************
const kDate = sha256(date, "TC3" + SECRET_KEY)
const kService = sha256(service, kDate)
const kSigning = sha256("tc3_request", kService)
const signature = sha256(stringToSign, kSigning, "hex")

// ************* 步骤 4：拼接 Authorization *************
const authorization =
  algorithm +
  " " +
  "Credential=" +
  SECRET_ID +
  "/" +
  credentialScope +
  ", " +
  "SignedHeaders=" +
  signedHeaders +
  ", " +
  "Signature=" +
  signature

// ************* 步骤 5：构造并发起请求 *************
const headers = {
  Authorization: authorization,
  "Content-Type": "application/json; charset=utf-8",
  Host: host,
  "X-TC-Action": action,
  "X-TC-Timestamp": timestamp,
  "X-TC-Version": version,
}

if (region) {
  headers["X-TC-Region"] = region
}
if (TOKEN) {
  headers["X-TC-Token"] = TOKEN
}

const options = {
  hostname: host,
  method: httpRequestMethod,
  headers,
}

console.log(`Starting request to ${host} with payload: ${payload}`);
const req = https.request(options, (res) => {
  let data = ""
  res.on("data", (chunk) => {
    data += chunk
  })

  res.on("end", () => {
    try {
      const response = JSON.parse(data);
      console.log('Request successful:', response);
    } catch (e) {
      console.log('Raw response:', data);
    }
  })
})

req.on("error", (error) => {
  console.error('Request failed:', error);
})

req.write(payload)

req.end()