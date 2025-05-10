interface BoardMember {
  userId: string;
}

export interface BoardWithMembers {
  ownerId: string;
  members: BoardMember[];
}
