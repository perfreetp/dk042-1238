import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'database.sqlite');
const migrationsPath = join(__dirname, '..', 'migrations', '001_init.sql');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
console.log('Connected to SQLite database');

initializeDatabase();

function initializeDatabase() {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  if (!row) {
    console.log('Creating tables...');
    const sql = fs.readFileSync(migrationsPath, 'utf8');
    db.exec(sql);
    console.log('Tables created successfully');
    insertInitialData();
  } else {
    console.log('Tables already exist');
  }
}

function insertInitialData() {
  const passwordHash = bcrypt.hashSync('admin123', 10);
  
  const usersSql = `
    INSERT INTO users (username, email, password_hash, role, bio, avatar) VALUES
    ('admin', 'admin@aiplaza.com', ?, 'admin', '平台管理员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
    ('creator01', 'creator@example.com', ?, 'creator', 'AI 爱好者，专注于前端开发和机器学习应用', 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator01'),
    ('user01', 'user@example.com', ?, 'user', '普通用户，喜欢体验各种 AI 应用', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user01')
  `;
  
  db.prepare(usersSql).run(passwordHash, passwordHash, passwordHash);
  console.log('Initial users inserted');
  insertSampleProjects();
}

function insertSampleProjects() {
  const sampleProjects = [
    {
      title: '智能写作助手',
      description: '基于 GPT 的智能写作工具，支持文章生成、润色、翻译等功能。可以帮助你快速生成高质量的文章内容，支持多种文体风格。',
      category_id: 1,
      author_id: 2,
      experience_url: 'https://chat.openai.com',
      experience_type: 'external',
      is_free: 1,
      tech_stack: JSON.stringify(['React', 'Node.js', 'OpenAI API']),
      tags: JSON.stringify(['写作', 'AI', 'GPT']),
      screenshots: JSON.stringify([
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20AI%20writing%20assistant%20interface%20with%20text%20editor%20ui&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20content%20generation%20dashboard%20with%20options%20panel&image_size=landscape_16_9'
      ]),
      cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20writing%20assistant%20hero%20banner%20futuristic%20blue%20theme&image_size=landscape_16_9',
      changelog: JSON.stringify([
        { version: '1.0.0', date: '2024-01-15', description: '初始版本发布' },
        { version: '1.1.0', date: '2024-02-20', description: '新增多语言翻译功能' }
      ]),
      usage_limit: '免费用户每日 10 次调用，Pro 用户不限',
      license: 'MIT',
      open_source_url: 'https://github.com/example/ai-writer',
      status: 'approved',
      is_featured: 1
    },
    {
      title: 'AI 图像生成器',
      description: '基于 Stable Diffusion 的图像生成工具，支持文生图、图生图、风格转换等多种功能。',
      category_id: 2,
      author_id: 2,
      experience_url: 'https://stablediffusionweb.com',
      experience_type: 'external',
      is_free: 0,
      tech_stack: JSON.stringify(['Python', 'PyTorch', 'FastAPI']),
      tags: JSON.stringify(['图像', 'AI', '绘画']),
      screenshots: JSON.stringify([
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20image%20generation%20app%20interface%20with%20gallery&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stable%20diffusion%20workspace%20with%20prompt%20input&image_size=landscape_16_9'
      ]),
      cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20art%20generator%20colorful%20creative%20banner&image_size=landscape_16_9',
      changelog: JSON.stringify([
        { version: '1.0.0', date: '2024-01-10', description: '初始版本发布' }
      ]),
      usage_limit: '免费版每日 5 张，Pro 版 99 元/月不限量',
      license: 'Apache-2.0',
      open_source_url: 'https://github.com/example/ai-image',
      status: 'approved',
      is_featured: 1
    },
    {
      title: '智能文档处理',
      description: 'AI 驱动的办公文档处理工具，支持 PDF 解析、表格识别、文档摘要、格式转换等功能。',
      category_id: 3,
      author_id: 2,
      experience_url: 'https://www.adobe.com/sensei.html',
      experience_type: 'external',
      is_free: 1,
      tech_stack: JSON.stringify(['Vue.js', 'Python', 'OCR']),
      tags: JSON.stringify(['办公', '文档', 'OCR']),
      screenshots: JSON.stringify([
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=document%20processing%20software%20interface%20with%20PDF%20viewer&image_size=landscape_16_9'
      ]),
      cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20office%20document%20processing%20tool%20banner&image_size=landscape_16_9',
      changelog: JSON.stringify([
        { version: '1.0.0', date: '2024-02-01', description: '初始版本发布' }
      ]),
      usage_limit: '免费用户每日处理 5 个文档',
      license: 'MIT',
      open_source_url: 'https://github.com/example/doc-ai',
      status: 'approved',
      is_featured: 0
    },
    {
      title: 'AI 学习助手',
      description: '个性化 AI 学习助手，根据你的学习进度和薄弱点提供定制化的学习方案和练习题。',
      category_id: 4,
      author_id: 2,
      experience_url: 'https://www.khanacademy.org',
      experience_type: 'external',
      is_free: 1,
      tech_stack: JSON.stringify(['React Native', 'Node.js', 'MongoDB']),
      tags: JSON.stringify(['学习', '教育', 'AI']),
      screenshots: JSON.stringify([
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20learning%20assistant%20app%20with%20progress%20dashboard&image_size=landscape_16_9'
      ]),
      cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20education%20tutor%20colorful%20learning%20banner&image_size=landscape_16_9',
      changelog: JSON.stringify([
        { version: '1.0.0', date: '2024-01-25', description: '初始版本发布' }
      ]),
      usage_limit: '完全免费',
      license: 'GPL-3.0',
      open_source_url: 'https://github.com/example/ai-tutor',
      status: 'approved',
      is_featured: 0
    },
    {
      title: 'AI 音乐生成',
      description: '用 AI 创造属于你的音乐，支持多种风格和乐器，可自定义节奏、旋律和和弦进行。',
      category_id: 5,
      author_id: 2,
      experience_url: 'https://www.aiva.ai',
      experience_type: 'external',
      is_free: 0,
      tech_stack: JSON.stringify(['Python', 'TensorFlow', 'Web Audio API']),
      tags: JSON.stringify(['音乐', 'AI', '创作']),
      screenshots: JSON.stringify([
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20music%20generation%20studio%20interface%20with%20waveforms&image_size=landscape_16_9'
      ]),
      cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20music%20creator%20purple%20neon%20banner&image_size=landscape_16_9',
      changelog: JSON.stringify([
        { version: '1.0.0', date: '2024-03-01', description: '初始版本发布' }
      ]),
      usage_limit: '免费版每月 3 首，Pro 版 29 元/月不限',
      license: 'Proprietary',
      open_source_url: '',
      status: 'approved',
      is_featured: 1
    },
    {
      title: '智能翻译官',
      description: '实时多语言翻译工具，支持 100+ 语言互译，包含文本翻译、语音翻译、图片翻译等功能。',
      category_id: 1,
      author_id: 2,
      experience_url: 'https://translate.google.com',
      experience_type: 'external',
      is_free: 1,
      tech_stack: JSON.stringify(['React', 'Python', 'Transformers']),
      tags: JSON.stringify(['翻译', 'NLP', 'AI']),
      screenshots: JSON.stringify([
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20translation%20app%20interface%20with%20multi%20language%20support&image_size=landscape_16_9'
      ]),
      cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20translator%20global%20communication%20banner&image_size=landscape_16_9',
      changelog: JSON.stringify([
        { version: '1.0.0', date: '2024-02-15', description: '初始版本发布' }
      ]),
      usage_limit: '免费使用，API 调用有速率限制',
      license: 'MIT',
      open_source_url: 'https://github.com/example/ai-translate',
      status: 'approved',
      is_featured: 0
    },
    {
      title: 'AI 头像生成',
      description: '上传几张照片，AI 为你生成 100+ 不同风格的专业头像，包含商务、动漫、复古等多种风格。',
      category_id: 2,
      author_id: 2,
      experience_url: 'https://www.avatarai.me',
      experience_type: 'external',
      is_free: 0,
      tech_stack: JSON.stringify(['Next.js', 'Python', 'DreamBooth']),
      tags: JSON.stringify(['头像', 'AI', '图片']),
      screenshots: JSON.stringify([
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20avatar%20generator%20app%20showcasing%20different%20styles&image_size=landscape_16_9'
      ]),
      cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20avatar%20generator%20stylish%20portraits%20banner&image_size=landscape_16_9',
      changelog: JSON.stringify([
        { version: '1.0.0', date: '2024-03-10', description: '初始版本发布' }
      ]),
      usage_limit: '9.9 元生成 100 张头像',
      license: 'Proprietary',
      open_source_url: '',
      status: 'pending',
      is_featured: 0
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO projects (
      title, description, cover_image, screenshots, category_id, author_id,
      experience_url, experience_type, is_free, usage_limit, tech_stack,
      open_source_url, license, tags, status, is_featured, changelog,
      views_count, likes_count, favorites_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleProjects.forEach((project, index) => {
    stmt.run(
      project.title,
      project.description,
      project.cover_image,
      project.screenshots,
      project.category_id,
      project.author_id,
      project.experience_url,
      project.experience_type,
      project.is_free,
      project.usage_limit,
      project.tech_stack,
      project.open_source_url,
      project.license,
      project.tags,
      project.status,
      project.is_featured,
      project.changelog,
      Math.floor(Math.random() * 1000) + 100,
      Math.floor(Math.random() * 500) + 10,
      Math.floor(Math.random() * 200) + 5
    );
    console.log(`Sample project ${index + 1} inserted`);
  });

  insertSampleTopics();
}

function insertSampleTopics() {
  const sampleTopics = [
    {
      title: '效率工具精选',
      description: '精选提升工作和学习效率的 AI 工具，让你的生产力翻倍。',
      cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=productivity%20tools%20collection%20modern%20tech%20banner&image_size=landscape_16_9',
      project_ids: JSON.stringify([1, 3, 4])
    },
    {
      title: '创意设计工坊',
      description: '激发创意灵感的 AI 设计工具，让创作变得更简单有趣。',
      cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20design%20tools%20artistic%20AI%20banner&image_size=landscape_16_9',
      project_ids: JSON.stringify([2, 7, 5])
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO topics (title, description, cover_image, project_ids)
    VALUES (?, ?, ?, ?)
  `);

  sampleTopics.forEach((topic, index) => {
    stmt.run(topic.title, topic.description, topic.cover_image, topic.project_ids);
    console.log(`Sample topic ${index + 1} inserted`);
  });
}

export function runQuery(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      const result = db.prepare(sql).all(...params);
      resolve(result);
    } catch (err) {
      console.error('Query error:', err);
      reject(err);
    }
  });
}

export function runInsert(sql: string, params: any[] = []): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const info = db.prepare(sql).run(...params);
      resolve(Number(info.lastInsertRowid));
    } catch (err) {
      console.error('Insert error:', err);
      reject(err);
    }
  });
}

export function runUpdate(sql: string, params: any[] = []): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const info = db.prepare(sql).run(...params);
      resolve(info.changes);
    } catch (err) {
      console.error('Update error:', err);
      reject(err);
    }
  });
}
