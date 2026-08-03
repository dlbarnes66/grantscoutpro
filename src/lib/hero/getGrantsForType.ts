export const mockGrants = {
  Federal: [
    { id: 1, title: "STEM Innovation Grant", amount: "$250,000", deadline: "Aug 12" },
    { id: 2, title: "Community Development Fund", amount: "$100,000", deadline: "Sep 1" },
  ],
  State: [
    { id: 3, title: "Alabama Workforce Grant", amount: "$75,000", deadline: "Aug 20" },
  ],
  Education: [
    { id: 4, title: "K-12 Digital Learning Grant", amount: "$50,000", deadline: "Oct 5" },
  ],
  "Small Business": [
    { id: 5, title: "Small Business Growth Fund", amount: "$40,000", deadline: "Jul 30" },
  ],
  Nonprofit: [
    { id: 6, title: "Nonprofit Impact Grant", amount: "$60,000", deadline: "Aug 15" },
  ],
};

export function getGrantsForType(type: string) {
  return mockGrants[type] || [];
}
