export const WORD_LIST = [
  'Apple', 'Banana', 'Car', 'Dog', 'Elephant', 'Flower', 'Guitar', 'House', 'Ice Cream', 'Jellyfish',
  'Kangaroo', 'Lemon', 'Mountain', 'Notebook', 'Orange', 'Pencil', 'Queen', 'Rabbit', 'Sun', 'Tree',
  'Umbrella', 'Violin', 'Whale', 'Xylophone', 'Yo-yo', 'Zebra', 'Airplane', 'Bicycle', 'Camera', 'Dolphin',
  'Eagle', 'Fire', 'Giraffe', 'Hammer', 'Island', 'Jacket', 'Key', 'Ladder', 'Moon', 'Nurse',
  'Ocean', 'Pizza', 'Rain', 'Star', 'Tiger', 'Unicorn', 'Volcano', 'Window', 'Yacht', 'Zoo'
];

export const getRandomWords = (count: number): string[] => {
  const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
