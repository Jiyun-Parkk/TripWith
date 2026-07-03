import { create } from 'zustand';

// 초기 Mock 사용자 데이터
const INITIAL_USERS = [
  { uid: 'me', name: '나 (기획자)', email: 'friend@famtrip.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', bio: '친구들과 추억 가득한 여행 일정을 가장 신속하게 등록하는 기획 전담 총무입니다! ✈️' },
  { uid: 'mom', name: '민지', email: 'minji@famtrip.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100', bio: '언제나 든든한 든든형 방장님 🌟' },
  { uid: 'dad', name: '지수', email: 'jisu@famtrip.com', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100', bio: '길 잃어버리지 않게 해주는 최고의 길잡이 🗺️' },
  { uid: 'bro', name: '준우', email: 'junwoo@famtrip.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', bio: '묵묵히 분위기를 이끄는 든든 서포터 🎸' },
  { uid: 'friend1', name: '하은', email: 'haeun@famtrip.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', bio: '맛집 탐방과 이쁜 카페 킬러 ☕' },
  { uid: 'friend2', name: '성민', email: 'sungmin@famtrip.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100', bio: '사진 촬영 & 분위기 메이커 📸' },
  { uid: 'friend3', name: '태오', email: 'taeo@famtrip.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100', bio: '여행 갈 때 짐 최소화 주의자 🎒' },
  { uid: 'friend4', name: '지원', email: 'jiwon@famtrip.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', bio: '액티비티 체험 중독자 🏄' },
  { uid: 'friend5', name: '민석', email: 'minseok@famtrip.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100', bio: '리액션 담당 긍정 마인드 요정 ✨' }
];

// 초기 친구 관계
const INITIAL_FRIENDSHIPS = [
  { u1: 'me', u2: 'mom', createdAt: new Date('2026-06-01').getTime() },
  { u1: 'me', u2: 'dad', createdAt: new Date('2026-06-01').getTime() },
  { u1: 'me', u2: 'bro', createdAt: new Date('2026-06-01').getTime() },
  { u1: 'me', u2: 'friend1', createdAt: new Date('2026-06-02').getTime() },
  { u1: 'me', u2: 'friend2', createdAt: new Date('2026-06-03').getTime() }
];

// 초기 친구 요청 대기열 (태오 -> 나)
const INITIAL_FRIEND_REQUESTS = [
  { id: 'req_1', senderId: 'friend3', receiverId: 'me', status: 'pending', createdAt: new Date().getTime() }
];

// 초기 여행 데이터
const INITIAL_TRIPS = [
  {
    id: 101,
    title: '제주도 우정 폭발 & 온천 힐링 여행',
    range: '2026.07.03 - 2026.07.05',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=300',
    dday: 'D-Day',
    isPast: false,
    participants: ['me', 'mom', 'dad', 'bro'],
    memo: {
      text: '출발 당일 공항 지하 1층 커피숍 앞에서 8시 반까지 모이자! ☕',
      author: 'dad',
      authorName: '지수',
      time: '오전 09:15'
    }
  },
  {
    id: 102,
    title: '부산 가을 바다 & 먹방 정복 투어',
    range: '2025.10.12 - 2025.10.14',
    cover: 'https://images.unsplash.com/photo-1568040176319-33516f491c7f?auto=format&fit=crop&q=80&w=300',
    dday: '완료됨',
    isPast: true,
    participants: ['me', 'bro', 'dad'],
    memo: {
      text: '부산역 대형 보관소에 짐부터 먼저 안전하게 캐리어 보관해둡시다!',
      author: 'me',
      authorName: '나',
      time: '2025.10.12'
    }
  },
  {
    id: 103,
    title: '경주 역사 탐방 & 황리단길 소풍',
    range: '2024.11.05 - 2024.11.07',
    cover: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=300',
    dday: '완료됨',
    isPast: true,
    participants: ['me', 'mom'],
    memo: {
      text: '불국사 해설 프로그램 미리 가입 연동 완료! 시간 맞춰 입장해요.',
      author: 'mom',
      authorName: '민지',
      time: '2024.11.05'
    }
  }
];

// 초기 타임라인 아이템들 (Day 1, Day 2...)
const INITIAL_TIMELINE = {
  101: [
    { id: 1, day: 1, time: '10:00', type: 'flight', name: '제주공항 도착 및 렌터카 인수', address: '제주 제주시 공항로 2', creator: 'me', link: 'https://naver.me/jeju-airport' },
    { id: 2, day: 1, time: '12:30', type: 'food', name: '제주 명진전복 (점심식사)', address: '제주 제주시 구좌읍 해맞이해안로 1282', creator: 'mom', link: 'https://naver.me/FfMjnJbK' },
    { id: 3, day: 1, time: '14:30', type: 'sightseeing', name: '성산일출봉 하이킹', address: '제주 서귀포시 성산읍 성산리 1', creator: 'dad', link: 'https://naver.me/sungsan' },
    { id: 4, day: 1, time: '17:00', type: 'cafe', name: '오설록 티 뮤지엄', address: '제주 서귀포시 안덕면 신화역사로 15', creator: 'bro', link: 'https://naver.me/osulloc' },
    { id: 5, day: 2, time: '11:00', type: 'sightseeing', name: '협재해수욕장 산책', address: '제주 제주시 한림읍 협재리 2497-1', creator: 'mom', link: 'https://naver.me/hyeopjae' },
    { id: 6, day: 2, time: '13:00', type: 'food', name: '서귀포 매일올레시장 맛집 투어', address: '제주 서귀포시 중앙로62번길 18', creator: 'dad', link: 'https://naver.me/olle-market' }
  ],
  102: [
    { id: 11, day: 1, time: '11:30', type: 'food', name: '해운대 소문난암소갈비', address: '부산 해운대구 중동2로10번길 32.5', creator: 'me', link: 'https://naver.me/haeundae-beef' },
    { id: 12, day: 1, time: '15:00', type: 'sightseeing', name: '해운대 해변열차 탑승', address: '부산 해운대구 청사포로 116', creator: 'bro', link: 'https://naver.me/beach-train' },
    { id: 13, day: 2, time: '12:00', type: 'food', name: '쌍둥이 돼지국밥', address: '부산 남구 유엔평화로 35-1', creator: 'dad', link: 'https://naver.me/pork-soup' }
  ],
  103: [
    { id: 21, day: 1, time: '13:00', type: 'sightseeing', name: '경주 불국사 관람', address: '경북 경주시 불국로 385', creator: 'mom', link: 'https://naver.me/bulguksa' },
    { id: 22, day: 1, time: '18:30', type: 'sightseeing', name: '안압지(동궁과 월지) 야경', address: '경북 경주시 원화로 102', creator: 'me', link: 'https://naver.me/anapji' }
  ]
};

// 초기 일정별 댓글
const INITIAL_TIMELINE_COMMENTS = {
  2: [
    { id: 501, userId: 'dad', userName: '지수', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100', text: '여기 예전에 승현이가 강추했던 전복 돌솥밥 맛집 맞지? 기대된다!', timestamp: '오후 12:31' },
    { id: 502, userId: 'bro', userName: '준우', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100', text: '전복 버터구이도 꼭 예산안에 넣어줘!', timestamp: '오후 12:35' }
  ],
  3: [
    { id: 503, userId: 'mom', userName: '민지', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100', text: '성산일출봉 오르막 많으니까 다들 무조건 든든한 운동화 장착하고 오렴.', timestamp: '오후 02:40' }
  ]
};

// 초기 단톡방 채팅 데이터
const INITIAL_GROUP_CHATS = {
  101: [
    { id: 901, sender: 'mom', senderName: '민지', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100', text: '얘들아 슬슬 짐싸는 중인데 개인 세면도구 세트 챙겼니?', time: '오전 09:12' },
    { id: 902, sender: 'dad', senderName: '지수', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100', text: '렌터카는 동승자 운전자 등록 미리 완료해놨다! 🚗', time: '오전 09:15' },
    { id: 903, sender: 'me', senderName: '나 (기획자)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100', text: '감사해! 모바일 체크인은 전날 내가 일괄로 묶어서 발송해줄게.', time: '오전 09:20' }
  ],
  102: [
    { id: 910, sender: 'dad', senderName: '지수', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100', text: '부산 가을 바다 너무 좋았다~ 다음 번 지출 정산 최종 확인해주라.', time: '2025-10-15' }
  ]
};

// 초기 준비물 체크리스트
const INITIAL_CHECKLIST = {
  101: [
    { id: 1, text: '멤버 전체 비행기표 모바일 체크인', assignedTo: 'me', completed: true, category: 'shared' },
    { id: 2, text: '보조 배터리 및 고화질 카메라 준비', assignedTo: 'mom', completed: true, category: 'shared' },
    { id: 3, text: '운전면허증 및 카드 실물 확인', assignedTo: 'dad', completed: false, category: 'personal' },
    { id: 4, text: '비상약 세트 구비하기 (소화제, 밴드)', assignedTo: 'mom', completed: false, category: 'shared' },
    { id: 5, text: '포터블 블루투스 스피커 충전', assignedTo: 'bro', completed: false, category: 'personal' }
  ],
  102: [
    { id: 11, text: 'KTX 기차 단체석 예매 확인', assignedTo: 'me', completed: true, category: 'shared' },
    { id: 12, text: '편한 트래킹화 챙기기', assignedTo: 'mom', completed: true, category: 'personal' }
  ],
  103: [
    { id: 21, text: '경주 유적 입장권 미리 끊어두기', assignedTo: 'dad', completed: true, category: 'shared' }
  ]
};

// 초기 가계부 지출 데이터
const INITIAL_EXPENSES = {
  101: [
    { id: 1, category: '항공/교통', desc: '제주 왕복 비행기표 패키지 결제', amount: 480000, payer: 'dad', date: '2026-07-01' },
    { id: 2, category: '숙박', desc: '감성 오션뷰 독채 펜션 2박', amount: 350000, payer: 'mom', date: '2026-07-02' },
    { id: 3, category: '식비', desc: '명진전복 점심식사 4인', amount: 75000, payer: 'me', date: '2026-07-03' }
  ],
  102: [
    { id: 11, category: '항공/교통', desc: '서울-부산 왕복 KTX 단체권', amount: 320000, payer: 'dad', date: '2025-10-12' },
    { id: 12, category: '식비', desc: '암소갈비 외식 정산', amount: 220000, payer: 'mom', date: '2025-10-13' }
  ],
  103: [
    { id: 21, category: '숙박', desc: '경주 한옥 스테이 예약금', amount: 180000, payer: 'me', date: '2024-11-05' }
  ]
};

export const useTripStore = create((set, get) => ({
  // --- 상태 (State) ---
  activeTripId: null, // 현재 선택된 상세 여행 ID
  currentUser: INITIAL_USERS[0], // 로그인한 사용자 정보 (기본값: me)
  users: INITIAL_USERS,
  friendships: INITIAL_FRIENDSHIPS,
  friendRequests: INITIAL_FRIEND_REQUESTS,
  trips: INITIAL_TRIPS,
  timeline: INITIAL_TIMELINE,
  timelineComments: INITIAL_TIMELINE_COMMENTS,
  groupChats: INITIAL_GROUP_CHATS,
  checklist: INITIAL_CHECKLIST,
  expenses: INITIAL_EXPENSES,

  setActiveTripId: (tripId) => {
    set({ activeTripId: tripId });
  },

  // --- 사용자 인증 관련 액션 (Auth Actions) ---
  login: (email, password) => {
    // 마스터 로그인 매칭 또는 가상 계정 로그인
    const user = get().users.find(u => u.email === email);
    if (user) {
      set({ currentUser: user });
      return { success: true, user };
    }
    // 존재하지 않는 가상 이메일의 경우 신규 계정 가입을 유도하거나, 마스터 유저 자동 매칭
    const defaultUser = {
      uid: 'user_' + Date.now(),
      name: email.split('@')[0],
      email: email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      bio: '새로 합류한 트립위드 멤버 ✈️'
    };
    set(state => ({
      users: [...state.users, defaultUser],
      currentUser: defaultUser
    }));
    return { success: true, user: defaultUser };
  },

  signup: (name, email, password) => {
    const newUser = {
      uid: 'user_' + Date.now(),
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      bio: '우정을 계획하는 트립위드 기획자입니다! 🏝️'
    };
    set(state => ({
      users: [...state.users, newUser],
      currentUser: newUser
    }));
    return { success: true, user: newUser };
  },

  logout: () => {
    set({ currentUser: null });
  },

  updateProfile: (name, bio) => {
    set(state => {
      const updatedUser = { ...state.currentUser, name, bio };
      const updatedUsers = state.users.map(u => u.uid === state.currentUser.uid ? updatedUser : u);
      return {
        currentUser: updatedUser,
        users: updatedUsers
      };
    });
  },

  // --- 친구 관리 액션 (Friends Actions) ---
  sendFriendRequest: (targetUid) => {
    const senderId = get().currentUser.uid;
    const exists = get().friendRequests.some(r => r.senderId === senderId && r.receiverId === targetUid && r.status === 'pending');
    if (exists) return { success: false, message: '이미 보낸 신청이 존재합니다.' };

    const newRequest = {
      id: 'req_' + Date.now(),
      senderId,
      receiverId: targetUid,
      status: 'pending',
      createdAt: Date.now()
    };
    set(state => ({
      friendRequests: [...state.friendRequests, newRequest]
    }));
    return { success: true };
  },

  acceptFriendRequest: (requestId) => {
    const req = get().friendRequests.find(r => r.id === requestId);
    if (!req) return;

    set(state => {
      const updatedRequests = state.friendRequests.filter(r => r.id !== requestId);
      const newFriendship = { u1: req.senderId, u2: req.receiverId, createdAt: Date.now() };
      return {
        friendRequests: updatedRequests,
        friendships: [...state.friendships, newFriendship]
      };
    });
  },

  rejectFriendRequest: (requestId) => {
    set(state => ({
      friendRequests: state.friendRequests.filter(r => r.id !== requestId)
    }));
  },

  removeFriend: (friendUid) => {
    const myUid = get().currentUser.uid;
    set(state => ({
      friendships: state.friendships.filter(f => 
        !((f.u1 === myUid && f.u2 === friendUid) || (f.u2 === myUid && f.u1 === friendUid))
      )
    }));
  },

  // --- 여행 관리 액션 (Trips Actions) ---
  createTrip: (title, startDate, endDate) => {
    const newId = Date.now();
    const range = `${startDate.replace(/-/g, '.')} - ${endDate.replace(/-/g, '.')}`;
    const newTrip = {
      id: newId,
      title,
      range,
      cover: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=300',
      dday: 'D-Upcoming',
      isPast: false,
      participants: [get().currentUser.uid],
      memo: {
        text: '첫 공지를 작성해보세요! 📢',
        author: get().currentUser.uid,
        authorName: get().currentUser.name,
        time: '방금 전'
      }
    };
    set(state => ({
      trips: [newTrip, ...state.trips],
      timeline: { ...state.timeline, [newId]: [] },
      checklist: { ...state.checklist, [newId]: [] },
      expenses: { ...state.expenses, [newId]: [] },
      groupChats: { ...state.groupChats, [newId]: [] }
    }));
    return newTrip;
  },

  updateTripMemo: (tripId, text) => {
    set(state => {
      const now = new Date();
      const hours = now.getHours() % 12 || 12;
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = now.getHours() >= 12 ? '오후' : '오전';
      const timeStr = `${ampm} ${hours}:${minutes}`;

      const updatedTrips = state.trips.map(t => {
        if (t.id === tripId) {
          return {
            ...t,
            memo: {
              text,
              author: state.currentUser.uid,
              authorName: state.currentUser.name,
              time: timeStr
            }
          };
        }
        return t;
      });
      return { trips: updatedTrips };
    });
  },

  inviteFriendToTrip: (tripId, friendUid) => {
    set(state => {
      const updatedTrips = state.trips.map(t => {
        if (t.id === tripId) {
          const participants = t.participants.includes(friendUid)
            ? t.participants.filter(id => id !== friendUid) // 이미 초대되어 있으면 제외
            : [...t.participants, friendUid]; // 없으면 초대
          return { ...t, participants };
        }
        return t;
      });
      return { trips: updatedTrips };
    });
  },

  // --- 타임라인 액션 (Timeline Actions) ---
  addTimelineItem: (tripId, day, time, type, name, address, link) => {
    const newItem = {
      id: Date.now(),
      day,
      time,
      type,
      name,
      address,
      link: link || undefined,
      creator: get().currentUser.uid
    };
    set(state => {
      const currentList = state.timeline[tripId] || [];
      const updatedList = [...currentList, newItem].sort((a, b) => a.time.localeCompare(b.time));
      return {
        timeline: {
          ...state.timeline,
          [tripId]: updatedList
        }
      };
    });
  },

  deleteTimelineItem: (tripId, itemId) => {
    set(state => ({
      timeline: {
        ...state.timeline,
        [tripId]: (state.timeline[tripId] || []).filter(item => item.id !== itemId)
      }
    }));
  },

  addComment: (itemId, text) => {
    const newComment = {
      id: Date.now(),
      userId: get().currentUser.uid,
      userName: get().currentUser.name,
      avatar: get().currentUser.avatar,
      text,
      timestamp: '방금 전'
    };
    set(state => {
      const itemComments = state.timelineComments[itemId] || [];
      return {
        timelineComments: {
          ...state.timelineComments,
          [itemId]: [...itemComments, newComment]
        }
      };
    });
  },

  // --- 채팅방 액션 (Chat Actions) ---
  sendChatMessage: (tripId, text) => {
    const newChat = {
      id: Date.now(),
      sender: get().currentUser.uid,
      senderName: get().currentUser.name,
      avatar: get().currentUser.avatar,
      text,
      time: '방금 전'
    };
    set(state => {
      const chats = state.groupChats[tripId] || [];
      return {
        groupChats: {
          ...state.groupChats,
          [tripId]: [...chats, newChat]
        }
      };
    });
  },

  // --- 준비물 체크리스트 액션 (Checklist Actions) ---
  addChecklistItem: (tripId, text, assignedTo, category) => {
    const newItem = {
      id: Date.now(),
      text,
      assignedTo,
      completed: false,
      category
    };
    set(state => ({
      checklist: {
        ...state.checklist,
        [tripId]: [...(state.checklist[tripId] || []), newItem]
      }
    }));
  },

  toggleChecklistItem: (tripId, itemId) => {
    set(state => {
      const updatedList = (state.checklist[tripId] || []).map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      return {
        checklist: {
          ...state.checklist,
          [tripId]: updatedList
        }
      };
    });
  },

  // --- 가계부 지출 정산 액션 (Expense Actions) ---
  addExpenseItem: (tripId, desc, amount, payer, category) => {
    const newItem = {
      id: Date.now(),
      category,
      desc,
      amount: parseInt(amount, 10) || 0,
      payer,
      date: new Date().toISOString().split('T')[0]
    };
    set(state => ({
      expenses: {
        ...state.expenses,
        [tripId]: [...(state.expenses[tripId] || []), newItem]
      }
    }));
  },

  // --- 1/N 상계 정산 연산 엔진 (Get Net Balances) ---
  getNetBalances: (tripId) => {
    const trip = get().trips.find(t => t.id === tripId);
    if (!trip) return [];
    
    const participants = trip.participants;
    const tripExpenses = get().expenses[tripId] || [];
    const totalCost = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
    const shareAmount = participants.length === 0 ? 0 : Math.round(totalCost / participants.length);

    return participants.map(uid => {
      const user = get().users.find(u => u.uid === uid) || { name: '알 수 없음', avatar: '' };
      const paid = tripExpenses.filter(e => e.payer === uid).reduce((sum, e) => sum + e.amount, 0);
      const net = paid - shareAmount;
      return {
        uid,
        name: user.name,
        avatar: user.avatar,
        paid,
        net // 양수이면 받아야 할 돈, 음수이면 보내야 할 돈
      };
    });
  }
}));
