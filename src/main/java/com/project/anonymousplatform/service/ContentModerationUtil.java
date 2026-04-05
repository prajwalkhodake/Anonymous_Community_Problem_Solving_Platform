package com.project.anonymousplatform.service;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

public class ContentModerationUtil {
    
    private static final List<String> RESTRICTED_WORDS = Arrays.asList(
        "abuse", "kill", "murder", "suicide", "fuck", "shit", "bitch", "asshole", "cunt", "ass", "bastard", "dickhead",
        "slut", "whore", "dick", "pussy", "porn", "sex", "nude", "nsfw", "rape", "pedophile"
    );

    public static boolean containsRestrictedContent(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        
        String lowerText = text.toLowerCase();
        for (String word : RESTRICTED_WORDS) {
            String regex = ".*\\b" + word + "\\b.*";
            if (Pattern.matches(regex, lowerText)) {
                return true;
            }
        }
        return false;
    }
}
