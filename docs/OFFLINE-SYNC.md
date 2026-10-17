# EduSphere AI — Offline-First SQLite Synchronization Engine

## Desktop Architecture
1. **Local Storage**: Embedded SQLite database located at `%APPDATA%/com.edusphere.desktop/edusphere.db`.
2. **Offline Durability**: All mutations write immediately to local SQLite and queue changes in `sync_queue`.
3. **Two-Way Synchronization**: When internet connectivity is detected, pending mutations are sent to Supabase, and remote updates are pulled.
4. **Conflict Resolution**: Timestamps and vector clocks detect conflicts, presenting visual conflict resolution options (Keep Local vs. Keep Cloud) for high-value financial and grade records.
