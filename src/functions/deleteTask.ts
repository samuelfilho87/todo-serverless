import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { Task } from '../types/Task';
import { document } from '../utils/dynamodbClient';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { id } = event.pathParameters;

  const response = await document
    .query({
      TableName: 'tasks',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id,
      },
    })
    .promise();

  const task = response.Items[0] as Task;

  if (!task) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Tarefa não existe.'
      }),
    };
  }

  await document
    .delete({
      TableName: 'tasks',
      Key: { id }
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Tarefa removida com sucesso.',
      task,
    }),
  };
}
