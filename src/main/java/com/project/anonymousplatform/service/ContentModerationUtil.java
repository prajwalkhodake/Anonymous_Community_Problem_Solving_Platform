package com.project.anonymousplatform.service;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Content moderation utility with pre-compiled regex for optimal performance.
 * Combines all restricted words into a single compiled pattern, so each
 * moderation check requires only one regex pass instead of N passes.
 */
public class ContentModerationUtil {
    
    private static final List<String> RESTRICTED_WORDS = Arrays.asList(
        "abuse", "kill", "murder", "suicide", "fuck", "shit", "bitch", "asshole", "cunt", "ass", "bastard", "dickhead",
        "slut", "whore", "dick", "pussy", "porn", "sex", "nude", "nsfw", "rape", "pedophile"
    );

    // Pre-compiled combined pattern — built once at class load time
    private static final Pattern RESTRICTED_PATTERN;

    static {
        String combined = RESTRICTED_WORDS.stream()
                .map(Pattern::quote)
                .collect(Collectors.joining("|"));
        RESTRICTED_PATTERN = Pattern.compile("\\b(" + combined + ")\\b", Pattern.CASE_INSENSITIVE);
    }

    public static boolean containsRestrictedContent(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        Matcher matcher = RESTRICTED_PATTERN.matcher(text);
        return matcher.find();
    }
}
