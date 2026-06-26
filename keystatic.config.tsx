import { config, fields, collection } from '@keystatic/core';

const isGitHub = process.env.NODE_ENV === 'production';

const storage = isGitHub
  ? ({
      kind: 'github' as const,
      repo: `${process.env.KEYSTATIC_REPO_OWNER ?? 'OWNER'}/${process.env.KEYSTATIC_REPO_NAME ?? 'REPO'}`,
    })
  : ({ kind: 'local' as const });

export default config({
  storage,
  ui: {
    brand: {
      name: 'Economic Sentinel',
    },
    navigation: {
      Content: ['articles'],
    },
  },
  collections: {
    articles: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'src/content/articles/*',
      format: { contentField: 'content', data: 'frontmatter' },
      entryLayout: 'content',
      columns: ['title', 'author', 'date'],
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'The article headline',
            validation: { isRequired: true },
          },
        }),
        author: fields.text({
          label: 'Author',
          description: 'Full name of the author',
          validation: { isRequired: true },
        }),
        authorRole: fields.text({
          label: 'Author role',
          description: 'e.g. "Student Researcher", "Lead Researcher, Cohort I"',
          defaultValue: 'Student Researcher',
        }),
        date: fields.date({
          label: 'Publish date',
          validation: { isRequired: true },
        }),
        category: fields.select({
          label: 'Category',
          description: 'Optional — used for internal organisation only',
          options: [
            { label: 'Economics', value: 'Economics' },
            { label: 'Finance', value: 'Finance' },
            { label: 'Business', value: 'Business' },
          ],
          defaultValue: 'Economics',
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          description: 'One or two sentences shown on the article card',
          multiline: true,
          validation: { isRequired: true },
        }),
        coverImage: fields.image({
          label: 'Cover image',
          description: 'Optional hero image',
          directory: 'public/images/articles',
          publicPath: '/images/articles/',
        }),
        content: fields.markdoc({
          label: 'Content',
          description: 'Full article body in Markdown',
          extension: 'md',
        }),
      },
    }),
  },
});
