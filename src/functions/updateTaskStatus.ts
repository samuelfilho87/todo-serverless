import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { Task } from '../types/Task';
import { document } from '../utils/dynamodbClient';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const { id, status } = event.pathParameters;

  const response = await document
    .query({
      TableName: 'tasks',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': id },
    })
    .promise();

  const task = response.Items[0] as Task;

  if (!task) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Tarefa não existe.' }),
    };
  }

  const date = new Date().getTime();

  await document
    .update({
      TableName: 'tasks',
      Key: { id },
      UpdateExpression: 'set #status = :status, #modified_at = :modified_at',
      ExpressionAttributeNames: { 
        '#status': 'status',
        '#modified_at': 'modified_at'
      },
      ExpressionAttributeValues: { 
        ':status': status,
        ':modified_at': date,
      },
    })
    .promise();

  task.status = status;
  task.modified_at = date;

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Status da tarefa atualiza com sucesso.',
      task,
    }),
  };
}
