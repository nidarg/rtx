import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: mqtt.MqttClient;
  private logger = new Logger('MQTT');

  onModuleInit() {
    // conectare la broker
    this.client = mqtt.connect('mqtt://localhost:1883');

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      // subscribe la topic-ul de telemetrie
      this.client.subscribe('devices/+/telemetry', (err) => {
        if (!err) this.logger.log('Subscribed to devices/+/telemetry');
      });
    });

    this.client.on('message', (topic, message) => {
      // mesajul vine ca Buffer
      this.logger.log(`Received message from ${topic}: ${message.toString()}`);
    });
  }

  publish(topic: string, payload: string) {
    this.client.publish(topic, payload);
    this.logger.log(`Published ${payload} to ${topic}`);
  }
  subscribe(topic: string, callback: (topic: string, message: Buffer) => void) {
    this.client.subscribe(topic, (err) => {
      if (!err) this.logger.log(`Subscribed to ${topic}`);
    });
    this.client.on('message', callback);
  }
}
