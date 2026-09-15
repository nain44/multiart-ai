<?php

namespace App\Services;

/**
 * Content Safety Filter.
 * Protects the app from displaying inappropriate or explicit wallpapers (e.g. bikini, NSFW, adult content).
 * Direct port of backend/src/utils/contentFilter.js.
 */
class ContentFilter
{
    public const BLOCKED_KEYWORDS = [
        // Swimwear & revealing clothing
        'bikini', 'bikinis', 'swimsuit', 'swimwear', 'monokini', 'cleavage', 'topless', 'bottomless',
        'undergarment', 'underwear', 'lingerie', 'bra', 'panty', 'panties', 'thong', 'microbikini',
        'beachwear', 'revealing', 'provocative', 'scantily', 'shirtless',

        // Nudity & Erotic / NSFW
        'nude', 'nudity', 'naked', 'erotic', 'erotica', 'nsfw', 'adult', '18+', 'xxx', 'porn', 'porno',
        'sex', 'sexy', 'sensual', 'seductive', 'fetish', 'striptease', 'pinup', 'playboy', 'playmate',
        'boobs', 'booty', 'babe', 'babes', 'hottie', 'boudoir', 'glamour', 'intimate', 'naughty', 'lust',

        // Explicit anatomy
        'nipple', 'nipples', 'areola', 'breast', 'breasts', 'vagina', 'vulva', 'labia', 'clitoris',
        'penis', 'genital', 'genitals', 'genitalia', 'testicle', 'testicles', 'scrotum', 'anus',
        'buttocks', 'pussy', 'cock', 'dick', 'vulgar',

        // Explicit acts / sexual content
        'masturbation', 'masturbating', 'orgasm', 'ejaculation', 'semen', 'cum', 'fellatio', 'blowjob',
        'intercourse', 'penetration', 'threesome', 'orgy', 'bdsm', 'bondage', 'hentai', 'ecchi',
        'onlyfans', 'camgirl', 'incest', 'bestiality',
    ];

    private const SUBSTRING_CHECK_EXCLUDE = ['lust', 'cock', 'dick', 'anus', 'cum'];

    public const DEFAULT_NEGATIVE_PROMPT =
        'bikini, bikinis, swimsuit, swimwear, monokini, lingerie, underwear, bra, panty, panties, thong, microbikini, cleavage, nude, nudity, naked, erotic, nsfw, adult, explicit, suggestive, revealing clothing, beachwear, boudoir, provocative, shirtless, topless, bare skin, exposed chest, intimate attire, sensual pose, unbuttoned, non-clothed, nipples, areola, breasts, genitals, vagina, penis, buttocks, pornographic, sexual content';

    private static ?string $blockedRegex = null;

    private static function blockedRegex(): string
    {
        if (self::$blockedRegex === null) {
            $escaped = array_map(fn($w) => preg_quote($w, '/'), self::BLOCKED_KEYWORDS);
            self::$blockedRegex = '/\b(' . implode('|', $escaped) . ')\b/i';
        }
        return self::$blockedRegex;
    }

    public static function isSafeText(?string $text): bool
    {
        if (!$text) {
            return true;
        }
        if (preg_match(self::blockedRegex(), $text) === 1) {
            return false;
        }

        $normalized = preg_replace('/[^a-z0-9]/', '', strtolower($text));
        foreach (self::BLOCKED_KEYWORDS as $word) {
            if (strlen($word) >= 4 && !in_array($word, self::SUBSTRING_CHECK_EXCLUDE, true) && str_contains($normalized, $word)) {
                return false;
            }
        }

        return true;
    }

    public static function isSafeContent(array $item): bool
    {
        if (!empty($item['title']) && !self::isSafeText($item['title'])) {
            return false;
        }
        if (!empty($item['description']) && !self::isSafeText($item['description'])) {
            return false;
        }
        if (!empty($item['tags']) && is_array($item['tags'])) {
            foreach ($item['tags'] as $tag) {
                if (!self::isSafeText($tag)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * @return array{isValid: bool, error?: string, negativePrompt: string}
     */
    public static function validateAiPrompt(?string $prompt): array
    {
        if (!$prompt || trim($prompt) === '') {
            return [
                'isValid' => false,
                'error' => 'Prompt is required.',
                'negativePrompt' => self::DEFAULT_NEGATIVE_PROMPT,
            ];
        }

        if (!self::isSafeText($prompt)) {
            return [
                'isValid' => false,
                'error' => 'Prompt contains restricted or inappropriate keywords (e.g. bikinis, swimwear, adult or revealing content). Please describe a family-safe wallpaper.',
                'negativePrompt' => self::DEFAULT_NEGATIVE_PROMPT,
            ];
        }

        return ['isValid' => true, 'negativePrompt' => self::DEFAULT_NEGATIVE_PROMPT];
    }
}
