const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Fetches file content from a given S3 bucket and object key.
 * @param {string} bucketName - S3 bucket name.
 * @param {string} objectKey - S3 object key.
 */

async function getObjectFromS3(bucketName, objectKey) {
  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };

  // Fetch the file from S3 and return the fileContent
  try {
    const data = await s3.getObject(params).promise();
    const fileContent = data.Body.toString("utf-8");
    return fileContent;
  } catch (err) {
    console.error("Error fetching file from S3:", err);
    throw new Error(err)
  }
}

module.exports = { getObjectFromS3 };
