import { z } from 'zod'

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const courseStatus = ["Draft", "Published", "Archived"] as const;
export const egyptianUniversities = [
  "Ahram Canadian University | جامعة الأهرام الكندية",
  "Air Force Academy | أكاديمية القوات الجوية",
  "Al-Azhar University | جامعة الأزهر",
  "Alamein International University | جامعة العلمين الدولية",
  "Alexandria University | جامعة الإسكندرية",
  "American University in Cairo | الجامعة الأمريكية بالقاهرة",
  "Arab Academy for Science and Technology | الأكاديمية العربية للعلوم والتكنولوجيا",
  "Arish University | جامعة العريش",
  "Assiut University | جامعة أسيوط",
  "Aswan University | جامعة أسوان",
  "Badr University in Assiut | جامعة بدر بأسيوط",
  "Badr University in Cairo | جامعة بدر بالقاهرة",
  "Benha University | جامعة بنها",
  "Beni Suef University | جامعة بني سويف",
  "British University in Egypt | الجامعة البريطانية في مصر",
  "Cairo University | جامعة القاهرة",
  "Canadian International College | الكلية الكندية الدولية",
  "Capital University | جامعة العاصمة",
  "Damietta University | جامعة دمياط",
  "Damanhour University | جامعة دمنهور",
  "Delta University | جامعة الدلتا",
  "Egypt Japan University of Science and Technology | الجامعة المصرية اليابانية للعلوم والتكنولوجيا",
  "Egyptian Chinese University | الجامعة المصرية الصينية",
  "Egyptian Russian University | الجامعة المصرية الروسية",
  "Ain Shams University | جامعة عين شمس",
  "Fayoum University | جامعة الفيوم",
  "French University in Egypt | الجامعة الفرنسية في مصر",
  "Future University in Egypt | جامعة المستقبل",
  "Galala University | جامعة الجلالة",
  "German University in Cairo | الجامعة الألمانية بالقاهرة",
  "Heliopolis University | جامعة هليوبوليس",
  "Higher Institute of Computer Science | المعهد العالي لعلوم الحاسب",
  "Higher Institute of Engineering | المعهد العالي للهندسة",
  "Higher Institute of Engineering and Technology | المعهد العالي للهندسة والتكنولوجيا",
  "Higher Institute of Management | المعهد العالي للإدارة",
  "Kafrelsheikh University | جامعة كفر الشيخ",
  "King Salman International University | جامعة الملك سلمان الدولية",
  "Luxor University | جامعة الأقصر",
  "Mansoura University | جامعة المنصورة",
  "Menoufia University | جامعة المنوفية",
  "Military Technical College | الكلية الفنية العسكرية",
  "Minia University | جامعة المنيا",
  "Misr International University | جامعة مصر الدولية",
  "Misr University for Science and Technology | جامعة مصر للعلوم والتكنولوجيا",
  "Modern Sciences and Arts University | جامعة العلوم الحديثة والآداب",
  "Modern University for Technology and Information | جامعة المعاصرة للعلوم والمعلومات",
  "Nahda University | جامعة النهضة",
  "National Telecommunication Institute | معهد الاتصالات القومي",
  "Naval Academy | الأكاديمية البحرية",
  "New Mansoura University | جامعة المنصورة الجديدة",
  "Newgiza University | جامعة نيوجيزة",
  "Nile University | جامعة النيل",
  "October 6 University | جامعة أكتوبر 6",
  "October University for Modern Sciences and Arts | جامعة أكتوبر للعلوم الحديثة والآداب",
  "Pharos University | جامعة فاروس",
  "Police Academy | أكاديمية الشرطة",
  "Port Said University | جامعة بورسعيد",
  "Sadat City University | جامعة مدينة السادات",
  "Sinai University | جامعة سيناء",
  "Sohag University | جامعة سوهاج",
  "South Valley University | جامعة جنوب الوادي",
  "Sphinx University | جامعة أبو الهول",
  "Suez Canal University | جامعة قناة السويس",
  "Suez University | جامعة السويس",
  "Tanta University | جامعة طنطا",
  "Thebes Academy | أكاديمية طيبة",
  "Zagazig University | جامعة الزقازيق",
  "Other | أخرى",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title must be at most 100 characters long" }),

  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" }),

  fileKey: z
    .string()
    .min(1, { message: "Please upload a course thumbnail" })
    .optional(),

  price: z
    .number({ message: "Price must be a number" })
    .min(1, { message: "Price must be at least 1" }),

  duration: z
    .number({ message: "Duration must be a number" })
    .min(1, { message: "Duration must be at least 1 hour" })
    .max(500, { message: "Duration must be at most 500 hours" }),

  level: z
    .enum(courseLevels, { message: "Please select a valid course level" }),

  university: z
    .enum(egyptianUniversities, {message: "University is required"}),

  smallDescription: z
    .string()
    .min(3, { message: "Small description must be at least 3 characters long" })
    .max(200, { message: "Small description must be at most 200 characters long" }),

  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long" }),

  status: z
    .enum(courseStatus, { message: "status is required" }),
  trailerVideoId: z
    .string()
    .min(1, { message: "Please upload a course trailer" }),

  trailerDuration: z
    .number()
    .min(60, { message: "Trailer must be at least 1 minute" })
    .max(300, { message: "Trailer must be at most 5 minutes" }),
})

export type CourseSchemaType = z.infer<typeof courseSchema>
