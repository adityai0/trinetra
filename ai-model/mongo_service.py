from __future__ import annotations

from datetime import datetime, timezone
import os
from typing import Any

from pymongo import MongoClient


class MongoLogService:
    def __init__(self) -> None:
        self.uri = os.getenv('MONGODB_URI')
        self.db_name = os.getenv('MONGODB_DB', 'trinetra')
        self.collection_name = os.getenv('MONGODB_COLLECTION', 'alert_logs')
        self.client: MongoClient | None = None
        self.collection = None

    def connect(self) -> bool:
        if not self.uri:
            print('MongoDB is disabled: MONGODB_URI is not set.')
            return False

        try:
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=5000)
            self.client.admin.command('ping')
            self.collection = self.client[self.db_name][self.collection_name]
            self.collection.create_index('timestamp')
            print(f'MongoDB connected: {self.db_name}.{self.collection_name}')
            return True
        except Exception as error:
            print(f'MongoDB connection error: {error}')
            self.client = None
            self.collection = None
            return False

    def push_alert_log(self, payload: dict[str, Any]) -> bool:
        if self.collection is None:
            return False

        try:
            self.collection.insert_one(payload)
            return True
        except Exception as error:
            print(f'MongoDB insert error: {error}')
            return False

    @staticmethod
    def build_timestamp() -> str:
        return datetime.now(timezone.utc).isoformat()

    def close(self) -> None:
        if self.client is not None:
            self.client.close()
