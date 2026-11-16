package com.company.smarttimechecking.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ATTENDANCE_EXCHANGE = "attendance.events.exchange";
    public static final String PUNCH_QUEUE = "attendance.punch.queue";
    public static final String NOTIFICATION_QUEUE = "attendance.notification.queue";
    public static final String PUNCH_ROUTING_KEY = "attendance.punch.#";

    @Bean
    public TopicExchange attendanceExchange() {
        return new TopicExchange(ATTENDANCE_EXCHANGE);
    }

    @Bean
    public Queue punchQueue() {
        return QueueBuilder.durable(PUNCH_QUEUE).build();
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    @Bean
    public Binding punchBinding(Queue punchQueue, TopicExchange attendanceExchange) {
        return BindingBuilder.bind(punchQueue).to(attendanceExchange).with(PUNCH_ROUTING_KEY);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange attendanceExchange) {
        return BindingBuilder.bind(notificationQueue).to(attendanceExchange).with("attendance.notification.#");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}

