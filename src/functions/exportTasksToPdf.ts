import { APIGatewayProxyHandler } from 'aws-lambda';
import { document } from '../utils/dynamodbClient';
import { compile } from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';
import puppeteer from 'puppeteer';
import { S3 } from 'aws-sdk';
import { Task } from '../types/Task';

interface ITemplate {
  tasks: Task[];
}

const compileTemplate = async (data: ITemplate) => {
  const filePath = join(process.cwd(), 'src', 'templates', 'tasks.hbs');

  const html = readFileSync(filePath, 'utf8');

  return compile(html)(data);
};

export const handler: APIGatewayProxyHandler = async () => {
  const response = await document
    .scan({ TableName: 'tasks' })
    .promise();

  const tasks = response.Items as Task[];

  try {
    const content = await compileTemplate({ tasks });

    const browser = await puppeteer.launch();
  
    const page = await browser.newPage();
  
    await page.setContent(content);

    const time = new Date().getTime();
  
    const pdf = await page.pdf({
      format: 'a4',
      printBackground: true,
      preferCSSPageSize: true,
    });
  
    const s3 = new S3();
  
    await s3
      .putObject({
        Bucket: 'todo-teste',
        Key: `${time}.pdf`,
        ACL: 'public-read',
        Body: pdf,
        ContentType: 'application/pdf',
      })
      .promise();
  
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'PDF criado com sucesso',
        url: `https://todo-teste.s3.amazonaws.com/${time}.pdf`,
      }),
    };
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({message: err.message})
    };
  }
};
