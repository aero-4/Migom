"""empty message

Revision ID: 75f4184f09e7
Revises: a9d11a559718
Create Date: 2025-12-02 19:42:10.749622

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '75f4184f09e7'
down_revision: Union[str, None] = 'a9d11a559718'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
