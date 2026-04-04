from django.core.management.base import BaseCommand
from apps.product_service.models import Category


CATEGORIES = [
    {"name": "Electronics",      "slug": "electronics",      "parent": None},
    {"name": "Phones",           "slug": "phones",           "parent": "electronics"},
    {"name": "Laptops",          "slug": "laptops",          "parent": "electronics"},
    {"name": "Accessories",      "slug": "accessories",      "parent": "electronics"},
    {"name": "Fashion",          "slug": "fashion",          "parent": None},
    {"name": "Men's Clothing",   "slug": "mens-clothing",    "parent": "fashion"},
    {"name": "Women's Clothing", "slug": "womens-clothing",  "parent": "fashion"},
    {"name": "Home & Living",    "slug": "home-living",      "parent": None},
    {"name": "Furniture",        "slug": "furniture",        "parent": "home-living"},
    {"name": "Kitchen",          "slug": "kitchen",          "parent": "home-living"},
    {"name": "Sports",           "slug": "sports",           "parent": None},
    {"name": "Books",            "slug": "books",            "parent": None},
]


class Command(BaseCommand):
    help = "Seeds the categories table with default categories."

    def handle(self, *args, **options):
        created_count = 0

        # First pass — create all top-level categories
        for cat in CATEGORIES:
            if cat["parent"] is None:
                obj, created = Category.objects.get_or_create(
                    slug=cat["slug"],
                    defaults={"name": cat["name"]},
                )
                if created:
                    created_count += 1
                    self.stdout.write(f"  Created: {obj.name}")
                else:
                    self.stdout.write(f"  Already exists: {obj.name}")

        # Second pass — create child categories
        for cat in CATEGORIES:
            if cat["parent"] is not None:
                try:
                    parent = Category.objects.get(slug=cat["parent"])
                    obj, created = Category.objects.get_or_create(
                        slug=cat["slug"],
                        defaults={"name": cat["name"], "parent": parent},
                    )
                    if created:
                        created_count += 1
                        self.stdout.write(f"  Created: {obj.name} (under {parent.name})")
                    else:
                        self.stdout.write(f"  Already exists: {obj.name}")
                except Category.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f"  Parent '{cat['parent']}' not found for {cat['name']}")
                    )

        self.stdout.write(self.style.SUCCESS(
            f"Done. {created_count} new categorie(s) created."
        ))