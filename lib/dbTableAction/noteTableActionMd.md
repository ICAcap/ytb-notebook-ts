# 🛠️ Data Level Access: Note Service Checklist

## 1. Core CRUD Operations
- [x] `createNote(userId, videoId, startTime, endTime, content, color, screenshotUrl)`
- [x] `updateNote(userId, noteId, startTime, endTime, content, color, screenshotUrl)`
- [x] `deleteNote(noteId, userId)`
- [ ] `getNotesByVideo(videoId, userId)` // Sorted by startTime ASC

## 2. Range-Specific Logic
- [ ] `getActiveNotes(videoId, currentTime)` // Logic: startTime <= currentTime <= endTime
- [ ] `getNextNote(videoId, currentTime)` // Logic: find smallest startTime > currentTime
- [ ] `getOverlappingNotes(videoId, start, end)` // Logic: detect range conflicts

## 3. Organization & Global Search
- [ ] `getNotesByColor(videoId, color)`
- [ ] `searchNotesContent(userId, query)` // Search within Tiptap JSON content
- [ ] `getNoteStats(userId)` // Total notes and total captured time (sum of durations)

## 4. Collection Integration
- [ ] `addVideoToCollection(userId, collectionId, videoId)`
- [ ] `removeVideoFromCollection(userId, collectionId, videoId)`
- [ ] `getCollectionWithNotes(collectionId, userId)` // Join: Collection -> Videos -> Notes
