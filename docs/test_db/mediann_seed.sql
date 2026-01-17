-- mediann.dev Database Seed SQL
-- Скрипт заполнения БД реальными данными компании mediann.dev
-- Используйте этот файл для прямого импорта в PostgreSQL

-- ============================================================================
-- 1. TENANT (Компания)
-- ============================================================================

INSERT INTO public.tenants (id, name, slug, domain, is_active, contact_email, contact_phone, logo_url, primary_color, extra_data, created_at, updated_at, deleted_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'mediann.dev',
    'mediann-dev',
    'mediann.dev',
    true,
    'sales@mediann.dev',
    '+7 989 453 0373',
    'https://cdn.mediann.dev/logo/mediann-dev-logo.svg',
    '#00A3FF',
    '{"founded": 2022, "team_size": "8-12", "languages": ["ru", "en"], "timezone": "Europe/Moscow"}'::jsonb,
    NOW(),
    NOW(),
    NULL
);

-- ============================================================================
-- 2. TENANT SETTINGS
-- ============================================================================

INSERT INTO public.tenant_settings (id, tenant_id, default_locale, timezone, date_format, time_format, notify_on_inquiry, inquiry_email, telegram_chat_id, default_og_image, ga_tracking_id, ym_counter_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'ru',
    'Europe/Moscow',
    'DD.MM.YYYY',
    'HH:mm',
    true,
    'sales@mediann.dev',
    '@medianndev_bot',
    'https://cdn.mediann.dev/og/default-og.jpg',
    'G-XXXXXXXXXX',
    'XXXXXXXXXX'
);

-- ============================================================================
-- 3. SERVICES (Услуги)
-- ============================================================================

-- Web Development
INSERT INTO public.services (id, tenant_id, icon, image_url, price_from, price_currency, is_published, sort_order, version, created_at, updated_at, deleted_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440010'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'code',
    'https://cdn.mediann.dev/services/web-development.jpg',
    500000,
    'RUB',
    true,
    1,
    1,
    NOW(),
    NOW(),
    NULL
);

INSERT INTO public.service_locales (id, service_id, locale, title, slug, short_description, description, meta_title, meta_description, meta_keywords, og_image, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440011'::uuid,
    '550e8400-e29b-41d4-a716-446655440010'::uuid,
    'ru',
    'Веб-разработка (Full-Stack)',
    'web-development',
    'Полный цикл разработки веб-приложений',
    '<p>Разработаем ваше веб-приложение с нуля или модернизируем существующее. Работаем с современными стеками: React, Vue.js, FastAPI, Django, Node.js</p>',
    'Веб-разработка на FastAPI и React | mediann.dev',
    'Разработка веб-приложений full-stack. React, FastAPI, Node.js. 30+ проектов.',
    'веб-разработка, fastapi, react, full-stack',
    'https://cdn.mediann.dev/services/web-dev-og.jpg',
    NOW(),
    NOW()
);

INSERT INTO public.service_locales (id, service_id, locale, title, slug, short_description, description, meta_title, meta_description, meta_keywords, og_image, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440012'::uuid,
    '550e8400-e29b-41d4-a716-446655440010'::uuid,
    'en',
    'Web Development (Full-Stack)',
    'web-development-en',
    'Full cycle web application development',
    '<p>We develop web applications from scratch using modern tech stacks. React, FastAPI, Node.js, PostgreSQL, and more.</p>',
    'Full-Stack Web Development | mediann.dev',
    'Custom web applications with React, FastAPI, Node.js',
    'web development, fastapi, react, nodejs',
    'https://cdn.mediann.dev/services/web-dev-og-en.jpg',
    NOW(),
    NOW()
);

-- E-Commerce Development
INSERT INTO public.services (id, tenant_id, icon, image_url, price_from, price_currency, is_published, sort_order, version, created_at, updated_at, deleted_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440020'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'shopping-cart',
    'https://cdn.mediann.dev/services/ecommerce.jpg',
    800000,
    'RUB',
    true,
    2,
    1,
    NOW(),
    NOW(),
    NULL
);

INSERT INTO public.service_locales (id, service_id, locale, title, slug, short_description, description, meta_title, meta_description, meta_keywords, og_image, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440021'::uuid,
    '550e8400-e29b-41d4-a716-446655440020'::uuid,
    'ru',
    'E-Commerce разработка',
    'ecommerce-development',
    'Онлайн-магазины с высокими продажами',
    '<p>Создаем интернет-магазины, которые продают. Наши проекты приносят клиентам миллионы рублей дохода.</p>',
    'Разработка интернет-магазина | mediann.dev',
    'E-commerce на React + Node.js. Магазины с выручкой +2млн руб/мес',
    'интернет-магазин, e-commerce, ecommerce',
    'https://cdn.mediann.dev/services/ecommerce-og.jpg',
    NOW(),
    NOW()
);

-- CRM Development
INSERT INTO public.services (id, tenant_id, icon, image_url, price_from, price_currency, is_published, sort_order, version, created_at, updated_at, deleted_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440030'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'users',
    'https://cdn.mediann.dev/services/crm.jpg',
    600000,
    'RUB',
    true,
    3,
    1,
    NOW(),
    NOW(),
    NULL
);

-- ERP Development
INSERT INTO public.services (id, tenant_id, icon, image_url, price_from, price_currency, is_published, sort_order, version, created_at, updated_at, deleted_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440040'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'package',
    'https://cdn.mediann.dev/services/erp.jpg',
    1000000,
    'RUB',
    true,
    4,
    1,
    NOW(),
    NOW(),
    NULL
);

-- Mobile Development
INSERT INTO public.services (id, tenant_id, icon, image_url, price_from, price_currency, is_published, sort_order, version, created_at, updated_at, deleted_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440050'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'mobile',
    'https://cdn.mediann.dev/services/mobile.jpg',
    700000,
    'RUB',
    true,
    5,
    1,
    NOW(),
    NOW(),
    NULL
);

-- ============================================================================
-- 4. CASES (Портфолио)
-- ============================================================================

-- Case 1: E-Commerce Fashion
INSERT INTO public.cases (id, tenant_id, status, published_at, cover_image_url, client_name, project_year, project_duration, is_featured, sort_order, version, created_at, updated_at, deleted_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440100'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'published',
    NOW(),
    'https://cdn.mediann.dev/cases/ecommerce-fashion.jpg',
    'Fashion Boutique',
    2024,
    '6 months',
    true,
    1,
    1,
    NOW(),
    NOW(),
    NULL
);

INSERT INTO public.case_locales (id, case_id, locale, title, slug, excerpt, description, results, meta_title, meta_description, meta_keywords, og_image, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440101'::uuid,
    '550e8400-e29b-41d4-a716-446655440100'::uuid,
    'ru',
    'Интернет-магазин с выручкой +2 млн. руб в месяц',
    'ecommerce-fashion-2024',
    'Разработали fashion e-commerce на React + Node.js с платежной системой',
    '<h3>Задача:</h3><p>Создать современный интернет-магазин для продажи одежды и аксессуаров</p><h3>Решение:</h3><ul><li>React фронтенд с красивым UI</li><li>Node.js бекенд с PostgreSQL</li><li>Интеграция с Stripe и Яндекс.Касса</li></ul>',
    '<p><strong>Результаты:</strong></p><ul><li>Выручка: +2 млн. руб в месяц</li><li>Конверсия: 3.5%</li><li>Время загрузки: 1.2с</li></ul>',
    'E-Commerce проект | выручка +2млн руб/мес',
    'Разработали интернет-магазин с выручкой 2 млн руб в месяц',
    'ecommerce, интернет-магазин, react',
    'https://cdn.mediann.dev/cases/ecommerce-og.jpg',
    NOW(),
    NOW()
);

-- Case 2: Telegram Mini App
INSERT INTO public.cases (id, tenant_id, status, published_at, cover_image_url, client_name, project_year, project_duration, is_featured, sort_order, version, created_at, updated_at, deleted_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440110'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'published',
    NOW(),
    'https://cdn.mediann.dev/cases/telegram-mini-app.jpg',
    'Crypto Exchange',
    2024,
    '3 months',
    true,
    2,
    1,
    NOW(),
    NOW(),
    NULL
);

INSERT INTO public.case_locales (id, case_id, locale, title, slug, excerpt, description, results, meta_title, meta_description, meta_keywords, og_image, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440111'::uuid,
    '550e8400-e29b-41d4-a716-446655440110'::uuid,
    'ru',
    'Первый в СНГ Telegram Mini App для обмена валют в 7 странах',
    'telegram-mini-app-crypto-2024',
    'Telegram Mini App для обмена криптовалют в 7 странах мира',
    '<h3>Задача:</h3><p>Создать Telegram Mini App для быстрого обмена валют</p><h3>Решение:</h3><p>Telegram Bot API, Blockchain интеграция</p>',
    '<p><strong>Результаты:</strong></p><ul><li>Активных пользователей: 50k+</li><li>Страны: 7</li><li>Обороты: $10M+</li></ul>',
    'Telegram Mini App для обмена валют',
    'Первое в СНГ приложение для обмена в Telegram',
    'telegram, mini app, crypto',
    'https://cdn.mediann.dev/cases/telegram-og.jpg',
    NOW(),
    NOW()
);

-- Case 3: CRM SaaS
INSERT INTO public.cases (id, tenant_id, status, published_at, cover_image_url, client_name, project_year, project_duration, is_featured, sort_order, version, created_at, updated_at, deleted_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440120'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'published',
    NOW(),
    'https://cdn.mediann.dev/cases/crm-saas.jpg',
    'B2B Company',
    2023,
    '4 months',
    true,
    3,
    1,
    NOW(),
    NOW(),
    NULL
);

INSERT INTO public.case_locales (id, case_id, locale, title, slug, excerpt, description, results, meta_title, meta_description, meta_keywords, og_image, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440121'::uuid,
    '550e8400-e29b-41d4-a716-446655440120'::uuid,
    'ru',
    'CRM система за 45 дней: 15k пользователей в месяц',
    'crm-saas-15k-users',
    'Разработали SaaS CRM систему с 15 тысячами UUV в месяц',
    '<h3>Задача:</h3><p>Быстро запустить CRM как SaaS с подпиской</p><h3>Решение:</h3><p>FastAPI, Vue.js, Stripe интеграция</p>',
    '<p>15k+ UUV, $50k MRR, NPS: 8.5</p>',
    'CRM SaaS проект | 15k пользователей',
    'CRM система за 45 дней с 15k активных пользователей',
    'crm, saas, subscription',
    'https://cdn.mediann.dev/cases/crm-og.jpg',
    NOW(),
    NOW()
);

-- ============================================================================
-- 5. ADVANTAGES (Преимущества)
-- ============================================================================

INSERT INTO public.advantages (id, tenant_id, icon, is_published, sort_order, version, created_at, updated_at, deleted_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440200'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'clock', true, 1, 1, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440201'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'eye', true, 2, 1, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440202'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'target', true, 3, 1, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440203'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'shield', true, 4, 1, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440204'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'users', true, 5, 1, NOW(), NOW(), NULL);

INSERT INTO public.advantage_locales (id, advantage_id, locale, title, description, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440205'::uuid, '550e8400-e29b-41d4-a716-446655440200'::uuid, 'ru', 'Вовремя и в бюджет', 'Сдаем проекты в срок. Наши сроки реалистичны и достижимы.', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440206'::uuid, '550e8400-e29b-41d4-a716-446655440201'::uuid, 'ru', 'Полная прозрачность', 'Еженедельные отчеты о прогрессе, доступ к repо, регулярные встречи.', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440207'::uuid, '550e8400-e29b-41d4-a716-446655440202'::uuid, 'ru', 'Результат, который продает', 'Проекты наших клиентов приносят доход от млн. рублей и выше.', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440208'::uuid, '550e8400-e29b-41d4-a716-446655440203'::uuid, 'ru', 'Гарантия качества', 'Code review, тестирование, документация. 6 месяцев поддержки после запуска.', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440209'::uuid, '550e8400-e29b-41d4-a716-446655440204'::uuid, 'ru', 'Опытная команда', 'Senior разработчики, архитекторы. 30+ успешных проектов.', NOW(), NOW());

-- ============================================================================
-- 6. PRACTICE AREAS (Области практики)
-- ============================================================================

INSERT INTO public.practice_areas (id, tenant_id, icon, is_published, sort_order, version, created_at, updated_at, deleted_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440300'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'shopping-cart', true, 1, 1, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440301'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'trending-up', true, 2, 1, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440302'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'briefcase', true, 3, 1, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440303'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'smartphone', true, 4, 1, NOW(), NOW(), NULL);

INSERT INTO public.practice_area_locales (id, practice_area_id, locale, title, slug, description, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440310'::uuid, '550e8400-e29b-41d4-a716-446655440300'::uuid, 'ru', 'E-Commerce', 'ecommerce', 'Интернет-магазины, маркетплейсы, системы платежей', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440311'::uuid, '550e8400-e29b-41d4-a716-446655440301'::uuid, 'ru', 'SaaS & Startups', 'saas-startups', 'Subscription-based сервисы, MVP разработка, скейлинг', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440312'::uuid, '550e8400-e29b-41d4-a716-446655440302'::uuid, 'ru', 'Enterprise', 'enterprise', 'Корпоративные системы, ERP, интеграции', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440313'::uuid, '550e8400-e29b-41d4-a716-446655440303'::uuid, 'ru', 'FinTech', 'fintech', 'Платежи, крипто, обмены, финансовые приложения', NOW(), NOW());

-- ============================================================================
-- 7. ADDRESSES (Офисы)
-- ============================================================================

INSERT INTO public.addresses (id, tenant_id, address_type, latitude, longitude, working_hours, phone, email, is_primary, sort_order, created_at, updated_at, deleted_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440400'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'office',
    43.1283,
    47.5030,
    '9:00-18:00 пн-пт',
    '+7 989 453 0373',
    'sales@mediann.dev',
    true,
    1,
    NOW(),
    NOW(),
    NULL
);

INSERT INTO public.address_locales (id, address_id, locale, name, country, city, street, building, postal_code, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440401'::uuid,
    '550e8400-e29b-41d4-a716-446655440400'::uuid,
    'ru',
    'Главный офис',
    'Россия',
    'Махачкала',
    'ул. Ермошкина',
    '17а',
    '367000',
    NOW(),
    NOW()
);

-- ============================================================================
-- 8. CONTACTS (Контакты)
-- ============================================================================

INSERT INTO public.contacts (id, tenant_id, contact_type, value, label, icon, is_primary, sort_order, created_at, updated_at, deleted_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440500'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'email', 'sales@mediann.dev', 'Sales', 'mail', true, 1, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440501'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'phone', '+7 989 453 0373', 'Phone', 'phone', true, 2, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440502'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'telegram', 'https://t.me/medianndev_bot', 'Telegram', 'send', true, 3, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440503'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'linkedin', 'https://linkedin.com/company/mediann-dev', 'LinkedIn', 'linkedin', false, 4, NOW(), NOW(), NULL);

-- ============================================================================
-- 9. FAQ (Часто задаваемые вопросы)
-- ============================================================================

INSERT INTO public.faqs (id, tenant_id, category, is_published, sort_order, version, created_at, updated_at, deleted_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440600'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'General', true, 1, 1, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440601'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'General', true, 2, 1, NOW(), NOW(), NULL),
    ('550e8400-e29b-41d4-a716-446655440602'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Process', true, 3, 1, NOW(), NOW(), NULL);

INSERT INTO public.faq_locales (id, faq_id, locale, question, answer, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440610'::uuid, '550e8400-e29b-41d4-a716-446655440600'::uuid, 'ru', 'Сколько стоит разработка?', '<p>Стоимость зависит от сложности, объема и сроков проекта. Минимальный проект начинается от 500k рублей. Мы предоставим бесплатную оценку после анализа вашего задания.</p>', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440611'::uuid, '550e8400-e29b-41d4-a716-446655440601'::uuid, 'ru', 'Какие технологии вы используете?', '<p>Мы используем современный стек: React, Vue.js, Next.js для фронтенда; FastAPI, Django, Node.js для бекенда; PostgreSQL, MongoDB для БД; Redis для кэширования.</p>', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440612'::uuid, '550e8400-e29b-41d4-a716-446655440602'::uuid, 'ru', 'Какой процесс разработки?', '<p>1. Консультация (бесплатно)<br>2. Техническое задание<br>3. Прототип/дизайн<br>4. Разработка (Agile/Scrum)<br>5. Тестирование<br>6. Запуск<br>7. Поддержка (6 месяцев)</p>', NOW(), NOW());

-- ============================================================================
-- 10. FEATURE FLAGS (Флаги функций)
-- ============================================================================

INSERT INTO public.feature_flags (id, tenant_id, feature_name, enabled, description, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440700'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'blog_module', true, 'Статьи и блог', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440701'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'cases_module', true, 'Портфолио и кейсы', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440702'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'reviews_module', true, 'Отзывы клиентов', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440703'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'team_module', true, 'Страница команды', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440704'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'faq_module', true, 'Часто задаваемые вопросы', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440705'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'seo_advanced', true, 'Расширенная SEO', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440706'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'analytics_advanced', true, 'Расширенная аналитика', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440707'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'multilang', true, 'Многоязычность', NOW(), NOW());

-- ============================================================================
-- VERIFY DATA
-- ============================================================================

-- Проверка: выводим созданные данные

SELECT '=== TENANT ===' as check_point;
SELECT COUNT(*) as tenants FROM public.tenants;

SELECT '=== SERVICES ===' as check_point;
SELECT COUNT(*) as services FROM public.services;

SELECT '=== CASES ===' as check_point;
SELECT COUNT(*) as cases FROM public.cases;

SELECT '=== FEATURE FLAGS ===' as check_point;
SELECT COUNT(*) as feature_flags FROM public.feature_flags;

-- Итого количество объектов в БД
SELECT 
    (SELECT COUNT(*) FROM public.services) +
    (SELECT COUNT(*) FROM public.service_locales) +
    (SELECT COUNT(*) FROM public.cases) +
    (SELECT COUNT(*) FROM public.case_locales) +
    (SELECT COUNT(*) FROM public.advantages) +
    (SELECT COUNT(*) FROM public.advantage_locales) +
    (SELECT COUNT(*) FROM public.practice_areas) +
    (SELECT COUNT(*) FROM public.practice_area_locales) +
    (SELECT COUNT(*) FROM public.faqs) +
    (SELECT COUNT(*) FROM public.faq_locales) +
    (SELECT COUNT(*) FROM public.addresses) +
    (SELECT COUNT(*) FROM public.address_locales) +
    (SELECT COUNT(*) FROM public.contacts) +
    (SELECT COUNT(*) FROM public.feature_flags) as total_objects;

-- ============================================================================
-- Использование:
-- psql -U postgres -d cms_db -f mediann_seed.sql
-- или
-- docker exec -i postgres-container psql -U postgres -d cms_db < mediann_seed.sql
-- ============================================================================
