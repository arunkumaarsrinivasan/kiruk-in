export default {
  name: 'lifeUpdate',
  title: 'Life Updates',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'content',
      title: 'Content',
      type: 'text',
      rows: 5,
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Daily Life', value: 'daily' },
          { title: 'Work & Career', value: 'work' },
          { title: 'Personal Growth', value: 'growth' },
          { title: 'Relationships', value: 'relationships' },
          { title: 'Health & Fitness', value: 'health' },
          { title: 'Travel & Adventure', value: 'travel' },
          { title: 'Learning & Education', value: 'learning' },
          { title: 'Creativity & Hobbies', value: 'creativity' },
          { title: 'Milestone', value: 'milestone' },
          { title: 'Reflection', value: 'reflection' }
        ]
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'mood',
      title: 'Mood',
      type: 'string',
      options: {
        list: [
          { title: '😄 Excited', value: 'excited' },
          { title: '😊 Happy', value: 'happy' },
          { title: '😌 Content', value: 'content' },
          { title: '🤔 Thoughtful', value: 'thoughtful' },
          { title: '😐 Neutral', value: 'neutral' },
          { title: '😔 Sad', value: 'sad' },
          { title: '😤 Frustrated', value: 'frustrated' },
          { title: '😴 Tired', value: 'tired' },
          { title: '🎉 Celebrating', value: 'celebrating' },
          { title: '💪 Motivated', value: 'motivated' }
        ]
      },
      initialValue: 'content'
    },
    {
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule: any) => Rule.required(),
      initialValue: () => new Date().toISOString().split('T')[0]
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string'
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true
          }
        }
      ]
    },
    {
      name: 'isPublic',
      title: 'Public',
      type: 'boolean',
      description: 'Should this update be visible on the public portfolio?',
      initialValue: false
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      date: 'date',
      mood: 'mood',
      media: 'images.0'
    },
    prepare(selection: any) {
      const { title, subtitle, date, mood, media } = selection
      const moodEmojis: { [key: string]: string } = {
        excited: '😄',
        happy: '😊',
        content: '😌',
        thoughtful: '🤔',
        neutral: '😐',
        sad: '😔',
        frustrated: '😤',
        tired: '😴',
        celebrating: '🎉',
        motivated: '💪'
      }
      return {
        title,
        subtitle: `${subtitle} • ${date} • ${moodEmojis[mood] || '😊'}`,
        media: media || '📝'
      }
    }
  }
}
