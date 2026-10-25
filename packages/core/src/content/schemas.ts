import { z } from 'zod';
import { BLOCKS, isTopicId } from './ids';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words joined by "-"');

export const topicIdSchema = z
  .string()
  .refine(isTopicId, 'Not a valid topic ID (expected a block and two digits, e.g. F04, C107)');

// ---- Topic bank (content/topic-bank.json) ----

export const topicBankEntrySchema = z.strictObject({
  id: topicIdSchema,
  title: z.string().min(1),
  coreYear: z.int().min(1).max(4),
  prerequisites: z.array(topicIdSchema),
  economicUse: z.string().min(1),
  /** The track a topic was added to the bank for (marked † in docs/05). */
  addedFor: slug.optional(),
});

export const topicBankSchema = z.array(topicBankEntrySchema).min(1);

export type TopicBankEntry = z.infer<typeof topicBankEntrySchema>;

// ---- Tracks (content/tracks/*.track.json), see docs/06-tracks.md ----

const topicListSchema = z.array(topicIdSchema).min(1);

/**
 * A course in a track. Completion counts `topics` and the topics in `sections` (headings the
 * app shows inside the course); `supporting` topics are shown as background but not counted.
 */
export const courseSchema = z
  .strictObject({
    code: z.string().min(1).nullable(),
    name: z.string().min(1),
    /** Semester number, a season, or "varies" when universities place the course differently. */
    semester: z.union([z.int().min(1), z.enum(['autumn', 'spring', 'varies'])]).nullable(),
    credits: z.number().positive().optional(),
    topics: topicListSchema.optional(),
    sections: z
      .array(z.strictObject({ title: z.string().min(1), topics: topicListSchema }))
      .min(1)
      .optional(),
    supporting: topicListSchema.optional(),
  })
  .refine((c) => c.topics !== undefined || c.sections !== undefined || c.supporting !== undefined, {
    message: 'A course needs topics, sections or supporting topics',
  });

export type Course = z.infer<typeof courseSchema>;

export const trackSchema = z
  .strictObject({
    id: slug,
    name: z.string().min(1),
    visibility: z.enum(['public', 'custom']),
    status: z.enum(['draft-unverified', 'verified']),
    verifiedAt: z.iso.date().nullable(),
    disclaimer: z.string().min(1),
    sources: z.array(
      z.strictObject({
        title: z.string().min(1),
        url: z.url(),
        note: z.string().min(1).optional(),
      }),
    ),
    years: z
      .array(
        z.strictObject({
          year: z.int().min(1),
          label: z.string().min(1),
          courses: z.array(courseSchema).min(1),
        }),
      )
      .min(1),
  })
  .refine((t) => t.status !== 'verified' || t.verifiedAt !== null, {
    message: 'A verified track needs a verifiedAt date',
    path: ['verifiedAt'],
  });

export type Track = z.infer<typeof trackSchema>;

// ---- Topic file frontmatter (content/topics/*.md), see docs/04-content-model.md ----

export const TOPIC_STATUSES = ['draft', 'reviewed', 'verified'] as const;
export const RESOURCE_KINDS = ['textbook', 'course', 'article', 'data', 'video'] as const;

export const topicFrontmatterSchema = z.strictObject({
  id: topicIdSchema,
  title: z.string().min(1),
  block: z.enum(BLOCKS),
  coreYear: z.int().min(1).max(4),
  prerequisites: z.array(topicIdSchema),
  estMinutes: z.int().positive(),
  status: z.enum(TOPIC_STATUSES),
  economicUses: z.array(z.string().min(1)).min(1),
  /** Other names students search for (syllabus headings, synonyms); they count like the title. */
  searchTerms: z.array(z.string().min(1)).optional(),
  /**
   * Names universities give this topic in their syllabi, shown small under the title so students
   * see that the same topic goes by other names. No university is named.
   */
  syllabusHeadings: z.array(z.string().min(1)).optional(),
  generators: z.array(slug),
  widgets: z.array(slug),
  mistakeCodes: z.record(
    z.string().regex(/^[A-Z][A-Z0-9_]*$/, 'Mistake codes are UPPER_CASE'),
    z.strictObject({ label: z.string().min(1), explanation: z.string().min(1) }),
  ),
  resources: z.array(
    z.strictObject({
      title: z.string().min(1),
      url: z.url(),
      kind: z.enum(RESOURCE_KINDS),
      verifiedAt: z.iso.date(),
    }),
  ),
});

export type TopicFrontmatter = z.infer<typeof topicFrontmatterSchema>;

// ---- Glossary (content/glossary.yml) ----

export const glossarySchema = z.record(z.string().min(1), z.string().min(1));
