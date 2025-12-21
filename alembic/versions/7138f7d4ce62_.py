"""empty message

Revision ID: 7138f7d4ce62
Revises: 75f4184f09e7
Create Date: 2025-12-13 13:33:51.590654

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7138f7d4ce62'
down_revision: Union[str, None] = '75f4184f09e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
