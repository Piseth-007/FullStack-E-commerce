<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class RealEmail implements ValidationRule
{
    /**
     * Common disposable / throwaway email provider domains.
     */
    protected array $disposableDomains = [
        'mailinator.com',
        'guerrillamail.com',
        'guerrillamail.net',
        'guerrillamail.org',
        'guerrillamailblock.com',
        '10minutemail.com',
        '10minutemail.net',
        'tempmail.com',
        'temp-mail.org',
        'temp-mail.io',
        'tempmailo.com',
        'yopmail.com',
        'yopmail.fr',
        'yopmail.net',
        'trashmail.com',
        'trashmail.net',
        'trashmail.me',
        'dispostable.com',
        'sharklasers.com',
        'getairmail.com',
        'throwawaymail.com',
        'nada.ltd',
        'getnada.com',
        'fakeinbox.com',
        'tempinbox.com',
        'burnermail.io',
        'mohmal.com',
        'emailondeck.com',
        'crazymailing.com',
        'dropmail.me',
        'inboxkitten.com',
        'mytemp.email',
        'fakemailgenerator.com',
        'generator.email',
        'maildrop.cc',
        'disposablemail.com',
        'emailfake.com',
        'zillamail.com',
        'armyspy.com',
        'cuvox.de',
        'dayrep.com',
        'fleckens.hu',
        'gustr.com',
        'jourrapide.com',
        'rhyta.com',
        'superrito.com',
        'teleworm.us',
        'tinypulse.com',
    ];

    /**
     * Common domain typo corrections.
     */
    protected array $commonDomainTypos = [
        'gamil.com' => 'gmail.com',
        'gmial.com' => 'gmail.com',
        'gmaill.com' => 'gmail.com',
        'gmai.com' => 'gmail.com',
        'hotmial.com' => 'hotmail.com',
        'hotmaill.com' => 'hotmail.com',
        'yaho.com' => 'yahoo.com',
        'yahooo.com' => 'yahoo.com',
        'outlok.com' => 'outlook.com',
        'outloo.com' => 'outlook.com',
    ];

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value) || trim($value) === '') {
            $fail('Please provide an email address.');
            return;
        }

        $email = strtolower(trim($value));

        // 1. Basic RFC syntax check
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $fail('Please enter a valid email address format (e.g. name@example.com).');
            return;
        }

        // 2. Validate domain structure
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            $fail('Please enter a valid email address.');
            return;
        }

        $domain = $parts[1];

        // Domain must contain at least one dot and have a valid TLD
        if (!str_contains($domain, '.') || str_ends_with($domain, '.')) {
            $fail('The email domain must have a valid top-level domain (e.g. .com, .org).');
            return;
        }

        $domainParts = explode('.', $domain);
        $tld = end($domainParts);
        if (strlen($tld) < 2) {
            $fail('The email domain has an invalid domain extension.');
            return;
        }

        // 3. Catch common typos
        if (array_key_exists($domain, $this->commonDomainTypos)) {
            $suggestion = $parts[0] . '@' . $this->commonDomainTypos[$domain];
            $fail("Did you mean {$suggestion}? Please verify your email address spelling.");
            return;
        }

        // 4. Block disposable / throwaway email addresses
        if (in_array($domain, $this->disposableDomains, true)) {
            $fail('Temporary and disposable email addresses are not permitted. Please use a real email address.');
            return;
        }

        // 5. DNS MX record check (verifies active mail servers exist)
        if (function_exists('checkdnsrr')) {
            if (!@checkdnsrr($domain, 'MX')) {
                $fail("The email domain '{$domain}' does not have active mail servers and cannot receive emails.");
                return;
            }
        }
    }
}
