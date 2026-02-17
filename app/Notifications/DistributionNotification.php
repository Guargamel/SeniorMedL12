<?php

// app/Notifications/DistributionNotification.php
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class DistributionNotification extends Notification
{
    public $distribution;

    public function __construct($distribution)
    {
        $this->distribution = $distribution;
    }

    public function via($notifiable)
    {
        return ['mail']; // Send email notification (can add other channels)
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->line('A new distribution has been made.')
            ->line('Medicine: ' . $this->distribution->medicine->name)
            ->line('Quantity: ' . $this->distribution->quantity)
            ->line('Thank you for using our system!');
    }
}
