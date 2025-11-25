package com.user_service.user_service.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailServiceImpl(JavaMailSender mailSender,
                            @Value("${app.email.from:no-reply@example.com}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public Mono<Void> sendUserCreatedEmail(String toEmail, String username, String plainPassword) {
        // prepare message
        String subject = "Your account has been created";
        String text = new StringBuilder()
                .append("Hello,\n\n")
                .append("Your account has been created.\n\n")
                .append("Username: ").append(username).append("\n")
                .append("Password: ").append(plainPassword).append("\n\n")
                .append("Please login and change your password immediately.\n\n")
                .append("Regards,\n")
                .append("Team")
                .toString();

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(toEmail);
        msg.setFrom(fromAddress);
        msg.setSubject(subject);
        msg.setText(text);

        // JavaMailSender is blocking; run send on boundedElastic
        return Mono.fromRunnable(() -> mailSender.send(msg))
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }
}
