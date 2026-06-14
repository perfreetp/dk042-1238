-- 用户表
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  bio TEXT,
  role VARCHAR(20) DEFAULT 'user',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  project_count INTEGER DEFAULT 0
);

-- 项目表
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  cover_image VARCHAR(255),
  screenshots TEXT,
  category_id INTEGER REFERENCES categories(id),
  author_id INTEGER REFERENCES users(id),
  experience_url VARCHAR(500),
  experience_type VARCHAR(20) DEFAULT 'external',
  is_free BOOLEAN DEFAULT 1,
  usage_limit TEXT,
  tech_stack TEXT,
  open_source_url VARCHAR(500),
  license VARCHAR(100),
  tags TEXT,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT 0,
  is_broken BOOLEAN DEFAULT 0,
  changelog TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 评论表
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id),
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 点赞表
CREATE TABLE likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, project_id)
);

-- 收藏表
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, project_id)
);

-- 协作者表
CREATE TABLE collaborators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, project_id)
);

-- 专题表
CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover_image VARCHAR(255),
  project_ids TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 反馈表
CREATE TABLE feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  type VARCHAR(50),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category_id);
CREATE INDEX idx_projects_author ON projects(author_id);
CREATE INDEX idx_comments_project ON comments(project_id);
CREATE INDEX idx_likes_project ON likes(project_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- 插入分类
INSERT INTO categories (name, slug, icon, description) VALUES
('文本生成', 'text', 'file-text', 'AI 写作、对话、翻译、摘要等文本类应用'),
('图像处理', 'image', 'image', 'AI 画图、修图、风格转换、图像识别等'),
('办公效率', 'office', 'briefcase', 'AI 办公助手、文档处理、数据分析等'),
('学习教育', 'learning', 'graduation-cap', 'AI 学习工具、智能教育、知识问答等'),
('娱乐休闲', 'entertainment', 'gamepad-2', 'AI 游戏、音乐、视频、趣味应用等');
