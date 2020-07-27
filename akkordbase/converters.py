import re
from transliterate import translit


class FullNameToSlugConverter:
    regex = r'[\da-zA-Zа-яА-ЯЁё_\-\+\.\,]+'

    def to_python(self, value):
        return translit(re.sub(r'[\+\_\.\,]', '-', value.lower()),
                        'ru',
                        reversed=True).replace('\'', '')

    def to_url(self, value):
        return value
