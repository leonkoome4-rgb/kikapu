import re

# Safaricom-allocated 3-digit prefixes (per Communications Authority of
# Kenya number allocation). STK Push can only reach these ranges.
_SAFARICOM_07_PREFIXES = {
    "700", "701", "702", "703", "704", "705", "706", "707", "708", "709",
    "710", "711", "712", "713", "714", "715", "716", "717", "718", "719",
    "722", "723", "724", "725", "726", "727", "728", "729",
    "740", "741", "742", "743", "745", "746",
    "757", "758", "759", "768", "769",
    "790", "791", "792", "793", "794", "795", "796", "797", "798", "799",
}
_SAFARICOM_01_PREFIXES = {"110", "111", "112", "113", "114", "115"}


class InvalidPhoneNumber(ValueError):
    pass


def normalize_phone(raw: str) -> str:
    """
    Normalize a Kenyan phone number to Daraja's required 2547XXXXXXXX /
    2541XXXXXXXX format, accepting whatever format a user is likely to type:
    0791234567, 791234567, +254791234567, 254791234567, with spaces/dashes.
    Rejects numbers outside Safaricom's allocated prefix ranges, since only
    those can ever receive an STK Push.
    """
    digits = re.sub(r"\D", "", raw or "")

    if digits.startswith("254") and len(digits) == 12:
        national = digits[3:]
    elif digits.startswith("0") and len(digits) == 10:
        national = digits[1:]
    elif len(digits) == 9:
        national = digits
    else:
        raise InvalidPhoneNumber(f"'{raw}' is not a recognizable Kenyan phone number")

    prefix = national[:3]
    if not (
        (national[0] == "7" and prefix in _SAFARICOM_07_PREFIXES)
        or (national[0] == "1" and prefix in _SAFARICOM_01_PREFIXES)
    ):
        raise InvalidPhoneNumber(
            f"'{raw}' is not a Safaricom M-PESA number — STK Push can only reach Safaricom lines"
        )

    return f"254{national}"
