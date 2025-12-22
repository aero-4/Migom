"""empty message

Revision ID: 4e43904abf52
Revises: 7138f7d4ce62
Create Date: 2025-12-17 23:07:33.709817

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e43904abf52'
down_revision: Union[str, None] = '7138f7d4ce62'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
