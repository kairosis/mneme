import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

export type MessageHandler = (content: Buffer, routingKey: string) => Promise<void>;

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  async onModuleInit(): Promise<void> {
    const url = process.env['RABBITMQ_URL'] ?? 'amqp://localhost';
    const exchange = process.env['RABBITMQ_EXCHANGE'] ?? 'kairosis.topic';
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertQueue('mneme.dlq', { durable: true });
    this.logger.log('RabbitMQ connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  async bindQueue(queue: string, routingKey: string, handler: MessageHandler): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    const exchange = process.env['RABBITMQ_EXCHANGE'] ?? 'kairosis.topic';

    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': 'mneme.dlq',
      },
    });
    await this.channel.bindQueue(queue, exchange, routingKey);

    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        await handler(msg.content, msg.fields.routingKey);
        this.channel!.ack(msg);
      } catch (err) {
        this.logger.error(`Failed to process message on ${queue}: ${err}`);
        this.channel!.nack(msg, false, false);
      }
    });

    this.logger.log(`Bound queue ${queue} to ${exchange} via ${routingKey}`);
  }
}
