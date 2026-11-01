import re

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validates password against enterprise security policy:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit."
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character (!@#$%^&*...)."
    return True, "Password is strong."

def sanitize_text(text: str) -> str:
    """
    Sanitizes text inputs against XSS and malicious script tags.
    """
    if not text:
        return ""
    # Strip HTML tags
    clean = re.sub(r"<[^>]*?>", "", text)
    # Strip control characters
    clean = "".join(ch for ch in clean if ch.isprintable() or ch in "\n\r\t")
    return clean.strip()

