import { randomUUID } from 'crypto';
import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { document } from '../utils/dynamodbClient';
import { Task } from '../types/Task';

interface ICreateTaskDTO {
  name: string,
  start_date: string,
  end_date: string,
  status: string,
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const data = JSON.parse(event.body) as ICreateTaskDTO;

  const task: Task = {
    id: randomUUID(),
    ...data,
    created_at: new Date().getTime(),
    modified_at: new Date().getTime(),
  }

  await document
    .put({
      TableName: 'tasks',
      Item: task,
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'Tarefa criada com sucesso.',
      task,
    }),
  };
}
