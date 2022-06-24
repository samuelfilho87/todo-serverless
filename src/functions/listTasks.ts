import { APIGatewayProxyHandler } from 'aws-lambda';
import { Task } from '../types/Task';
import { document } from '../utils/dynamodbClient';

export const handler: APIGatewayProxyHandler = async () => {
  const response = await document
    .scan({ TableName: 'tasks' })
    .promise();

  const tasks = response.Items as Task[];

  return {
    statusCode: 200,
    body: JSON.stringify({
      tasks
    }),
  };
}
