import { useState, useEffect, useCallback, useRef } from "react";
import { TrackerData, TaskStatus, UserProfileData } from "../types";
import { SYLLABUS, TASKS } from "../data";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}

export function useTracker(user: User | null) {
  const [data, setData] = useState<TrackerData | null>(null);
  const [profile, setProfile] = useState<UserProfileData>({});
  const [loadingData, setLoadingData] = useState(true);
  const lastSyncRef = useRef<string>("");

  useEffect(() => {
    if (!user) {
      setData(null);
      setLoadingData(false);
      return;
    }

    const docRef = doc(db, "users", user.uid);
    
    // Subscribe to Firestore changes
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        try {
          const rawData = snap.data().trackerData;
          setProfile(prev => {
            const nextProfile: UserProfileData = snap.data() || {};
            // Omit trackerData and ownerId and updatedAt
            delete (nextProfile as any).trackerData;
            delete (nextProfile as any).ownerId;
            delete (nextProfile as any).updatedAt;
            // A simple JSON stringify compare for nested fields instead of writing 50 line compare
            if (JSON.stringify(prev) === JSON.stringify(nextProfile)) return prev;
            return nextProfile;
          });
          if (rawData === lastSyncRef.current) return; // Skip if it's our own recent write
          const parsed = JSON.parse(rawData);
          setData(parsed);
          setLoadingData(false);
        } catch (e) {
          console.error("Error parsing user data");
        }
      } else {
        // Initialize Default Empty if not exists
        const initial: TrackerData = {};
        SYLLABUS.forEach((sub) => {
          initial[sub.subject] = {};
          sub.chapters.forEach((chap) => {
            initial[sub.subject][chap] = new Array(TASKS.length).fill(0);
          });
        });
        
        // Save to Firestore initially
        const initialStr = JSON.stringify(initial);
        setDoc(docRef, { ownerId: user.uid, trackerData: initialStr, updatedAt: new Date().toISOString() })
          .then(() => {
            setData(initial);
            lastSyncRef.current = initialStr;
            setLoadingData(false);
          });
      }
    });

    return () => unsub();
  }, [user]);

  // Sync mutation to Firestore
  const syncToFirestore = useCallback(async (newData: TrackerData) => {
    if (!user) return;
    try {
      const dataStr = JSON.stringify(newData);
      lastSyncRef.current = dataStr;
      await setDoc(doc(db, "users", user.uid), {
        ownerId: user.uid,
        trackerData: dataStr,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to sync to firestore", e);
    }
  }, [user]);

  const toggleStatus = useCallback((subject: string, chapter: string, taskIndex: number) => {
    if (!user) return;

    let nextData: TrackerData | null = null;

    setData((prev) => {
      if (!prev) return prev;
      const currentState = prev[subject][chapter][taskIndex];
      const nextState = ((currentState + 1) % 3) as TaskStatus;

      nextData = {
        ...prev,
        [subject]: {
          ...prev[subject],
          [chapter]: prev[subject][chapter].map((val, idx) =>
            idx === taskIndex ? nextState : val
          ),
        },
      };
      
      return nextData;
    });

    // Schedule sync (optimistic UI)
    // Use setTimeout to ensure toggleStatus callback stays fast and we get nextData from the setter closure
    setTimeout(() => {
      setData((current) => {
        if (current) syncToFirestore(current);
        return current;
      });
    }, 0);
  }, [user, syncToFirestore]);

  const getChapterProgress = (subject: string, chapter: string): number => {
    if (!data || !data[subject] || !data[subject][chapter]) return 0;
    const tasksArray = data[subject][chapter];
    const doneCount = tasksArray.filter((status) => status === 2).length;
    return (doneCount / TASKS.length) * 100;
  };

  const getSubjectProgress = (subject: string): number => {
    const chapters = SYLLABUS.find((s) => s.subject === subject)?.chapters;
    if (!chapters || chapters.length === 0) return 0;

    let totalPercent = 0;
    chapters.forEach((chap) => {
      totalPercent += getChapterProgress(subject, chap);
    });
    return totalPercent / chapters.length;
  };

  const getOverallProgress = () => {
    if (!data) return { percent: 0, done: 0, total: 1 };
    
    let totalTasks = 0;
    let doneTasks = 0;

    SYLLABUS.forEach((sub) => {
      sub.chapters.forEach((chap) => {
        totalTasks += TASKS.length;
        if (data[sub.subject] && data[sub.subject][chap]) {
          doneTasks += data[sub.subject][chap].filter((st) => st === 2).length;
        }
      });
    });

    const percent = totalTasks === 0 ? 0 : (doneTasks / totalTasks) * 100;
    return { percent, done: doneTasks, total: totalTasks };
  };

  const resetData = async () => {
    if (!user) return;
    const initial: TrackerData = {};
    SYLLABUS.forEach((sub) => {
      initial[sub.subject] = {};
      sub.chapters.forEach((chap) => {
        initial[sub.subject][chap] = new Array(TASKS.length).fill(0);
      });
    });
    await syncToFirestore(initial);
  };

  const exportData = () => {
    if (!data) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "hsc-tracker-backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json && typeof json === "object") {
          syncToFirestore(json);
        }
      } catch (err) {
        alert("Invalid backup file!");
      }
    };
    reader.readAsText(file);
  };

  const updateProfile = async (profileData: UserProfileData) => {
    if (!user) return;
    try {
      setProfile(profileData);
      await setDoc(doc(db, "users", user.uid), {
        ...profileData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  };

  return {
    data,
    profile,
    loadingData,
    toggleStatus,
    getChapterProgress,
    getSubjectProgress,
    getOverallProgress,
    resetData,
    exportData,
    importData,
    updateProfile,
  };
}
