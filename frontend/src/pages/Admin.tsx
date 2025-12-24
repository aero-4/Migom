import React, {useState, useEffect} from 'react';
import {useAuth} from '../context/AuthContext';
import NotFound from './NotFound';
import config from '../../config';
import {
    Tabs,
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Upload,
    Card,
    Row,
    Col,
    Statistic,
    Space,
    message
} from 'antd';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    UploadOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    ProductOutlined,
    CalculatorFilled,
    PlusOutlined,
    HeatMapOutlined
} from '@ant-design/icons';
import Login from './Login';

const {TabPane} = Tabs;
const {Option} = Select;
const {TextArea} = Input;

function Admin() {
    const {user, isAuthenticated} = useAuth();
    if (!isAuthenticated || !user) return <Login/>;
    if (user.role !== 4) {
        return <NotFound/>;
    }

    const [activeTab, setActiveTab] = useState('1');
    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userStats, setUserStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0
    });

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [orderStats, setOrderStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0
    });

    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentStats, setPaymentStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0
    });

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [addresses, setAddresses] = useState([]);

    const [productsLoading, setProductsLoading] = useState(false);
    const [productStats, setProductStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        year: 0
    });
    const [addProductModal, setAddProductModal] = useState(false);
    const [productForm] = Form.useForm();
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoUrl, setPhotoUrl] = useState('');

    const [detailModal, setDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailType, setDetailType] = useState('');


    useEffect(() => {
        if (activeTab === '1') {
            fetchUsers();
        }
        if (activeTab === '2') {
            fetchOrders();
        }
        if (activeTab === '3') {
            fetchPayments();
        }
        if (activeTab === '4') {
            fetchProducts();
        }
        if (activeTab === "5") {
            fetchCategories();
        }
        if (activeTab === "6") {
            fetchAddresses();
        }
    }, [activeTab]);


    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/users", {credentials: "include"});
            const data = await response.json();
            setUsers(data);

            // Расчет статистики
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

            const stats = {
                today: data.filter(u => new Date(u.created_at) >= today).length,
                week: data.filter(u => new Date(u.created_at) >= weekAgo).length,
                month: data.filter(u => new Date(u.created_at) >= monthAgo).length,
                year: data.filter(u => new Date(u.created_at) >= yearAgo).length
            };

            setUserStats(stats);
        } catch (error) {
            message.error('Ошибка при загрузке пользователей');
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/orders", {credentials: "include"});
            const data = await response.json();
            setOrders(data);

            // Расчет статистики
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

            const stats = {
                today: data.filter(o => new Date(o.created_at) >= today).length,
                week: data.filter(o => new Date(o.created_at) >= weekAgo).length,
                month: data.filter(o => new Date(o.created_at) >= monthAgo).length,
                year: data.filter(o => new Date(o.created_at) >= yearAgo).length
            };

            setOrderStats(stats);
        } catch (error) {
            message.error('Ошибка при загрузке заказов');
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchPayments = async () => {
        setPaymentsLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/payments", {credentials: "include"});
            const data = await response.json();
            setPayments(data);

            // Расчет статистики
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

            const stats = {
                today: data.filter(p => new Date(p.created_at) >= today).length,
                week: data.filter(p => new Date(p.created_at) >= weekAgo).length,
                month: data.filter(p => new Date(p.created_at) >= monthAgo).length,
                year: data.filter(p => new Date(p.created_at) >= yearAgo).length
            };

            setPaymentStats(stats);
        } catch (error) {
            message.error('Ошибка при загрузке платежей');
        } finally {
            setPaymentsLoading(false);
        }
    };

    const fetchCategories = async () => {
        setProductsLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/categories", {
                credentials: "include"
            });
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            message.error('Ошибка при загрузке продуктов');
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchProducts = async () => {
        setProductsLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/products", {
                credentials: "include"
            });
            const data = await response.json();
            setProducts(data);

            // Расчет статистики
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

            const stats = {
                today: data.filter(p => new Date(p.created_at) >= today).length,
                week: data.filter(p => new Date(p.created_at) >= weekAgo).length,
                month: data.filter(p => new Date(p.created_at) >= monthAgo).length,
                year: data.filter(p => new Date(p.created_at) >= yearAgo).length
            };

            setProductStats(stats);
        } catch (error) {
            message.error('Ошибка при загрузке продуктов');
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchAddresses = async () => {
        setProductsLoading(true);
        try {
            const response = await fetch(config.API_URL + "/api/addresses/all", {
                credentials: "include"
            });
            const data = await response.json();
            setAddresses(data);
        } catch (error) {
            message.error('Ошибка при загрузке продуктов');
        } finally {
            setProductsLoading(false);
        }
    };

    const handleAddProduct = async (values) => {
        try {
            const productData = {
                ...values,
                photo: photoUrl
            };

            const response = await fetch(config.API_URL + "/api/products", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
                credentials: "include"
            });

            if (response.ok) {
                message.success('Продукт успешно добавлен');
                setAddProductModal(false);
                productForm.resetFields();
                setPhotoUrl('');
                fetchProducts();
            } else {
                message.error('Ошибка при добавлении продукта');
            }
        } catch (error) {
            message.error('Ошибка при добавлении продукта');
        }
    };

    const handleUploadPhoto = async (file) => {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(config.API_URL + "/api/files", {
                method: 'POST',
                body: formData,
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                setPhotoUrl(data.url);
                message.success('Фото успешно загружено');
            } else {
                message.error('Ошибка при загрузке фото');
            }
        } catch (error) {
            message.error('Ошибка при загрузке фото');
        } finally {
            setUploadingPhoto(false);
        }

        return false; // Отменяем автоматическую загрузку
    };

    const showDetails = (record, type) => {
        setDetailData(record);
        setDetailType(type);
        setDetailModal(true);
    };

    // Колонки для таблицы пользователей
    const userColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Имя',
            dataIndex: 'first_name',
            key: 'first_name',
        },
        {
            title: 'Фамилия',
            dataIndex: 'last_name',
            key: 'last_name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Роль',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const roles = {
                    1: 'Пользователь',
                    2: 'Курьер',
                    3: 'Повар',
                    4: 'Админ'
                };
                return roles[role] || role;
            }
        },
        {
            title: 'Дата рождения',
            dataIndex: 'birthday',
            key: 'birthday',
            render: (date) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Button type="link" onClick={() => showDetails(record, 'user')}>
                    Подробнее
                </Button>
            )
        }
    ];

    // Колонки для таблицы заказов
    const orderColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Дата создания',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleString(),
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
            title: 'ID клиента',
            dataIndex: 'creator_id',
            key: 'creator_id',
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Сумма',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `${amount} ₽`
        },
        {
            title: 'Адрес',
            dataIndex: 'address',
            key: 'address',
            render: (address) => address ?
                `${address.city}, ${address.street}, д.${address.house_number}` : '-'
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Button type="link" onClick={() => showDetails(record, 'order')}>
                    Подробнее
                </Button>
            )
        }
    ];

    // Колонки для таблицы платежей
    const paymentColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Сумма',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `${amount} ₽`
        },
        {
            title: 'Описание',
            dataIndex: 'label',
            key: 'label',
        },
        {
            title: 'ID заказа',
            dataIndex: 'order_id',
            key: 'order_id',
        },
        {
            title: 'ID пользователя',
            dataIndex: 'user_id',
            key: 'user_id',
        },
        {
            title: 'Метод',
            dataIndex: 'method',
            key: 'method',
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
        }
    ];

    const categoriesColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Фото',
            dataIndex: 'photo',
            key: 'photo',
            render: (photo) => photo ? (
                <img src={photo} alt="product" style={{width: 50, height: 50, objectFit: 'cover'}}/>
            ) : '-'
        },
        {
            title: 'Слаг',
            dataIndex: 'slug',
            key: 'slug',
        },
    ]

    const addressesColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Юзер',
            dataIndex: 'user_id',
            key: 'user_id',
            sorter: (a, b) => a.user_id - b.user_id,
        },
        {
            title: 'Город',
            dataIndex: 'city',
            key: 'city',
        },{
            title: 'Улица',
            dataIndex: 'street',
            key: 'street',
        },{
            title: 'Номер дома',
            dataIndex: 'house_number',
            key: 'house_number',
        },{
            title: 'Подъезд',
            dataIndex: 'entrance',
            key: 'entrance',
        },{
            title: 'Этаж',
            dataIndex: 'floor',
            key: 'floor',
        },
        {
            title: 'Квартира',
            dataIndex: 'apartment_number',
            key: 'apartment_number',
        },{
            title: 'Комментарий',
            dataIndex: 'comment',
            key: 'comment',
        },{
            title: 'Оставить у двери',
            dataIndex: 'is_leave_at_door',
            key: 'is_leave_at_door',
        }

    ]

    // Колонки для таблицы продуктов
    const productColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            render: (price, record) => (
                <span>
          {record.discount_price ? (
              <>
              <span style={{textDecoration: 'line-through', color: '#999'}}>
                {price} ₽
              </span>
                  <span style={{color: '#ff4d4f', marginLeft: 8}}>
                {record.discount_price} ₽
              </span>
              </>
          ) : (
              `${price} ₽`
          )}
        </span>
            ),
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Количество',
            dataIndex: 'count',
            key: 'count',
        },
        {
            title: 'Граммы',
            dataIndex: 'grams',
            key: 'grams',
        },
        {
            title: 'Калории',
            dataIndex: 'kilocalorie',
            key: 'kilocalorie',
        },
        {
            title: 'Категория',
            dataIndex: 'category_id',
            key: 'category_id',
        },
        {
            title: 'Фото',
            dataIndex: 'photo',
            key: 'photo',
            render: (photo) => photo ? (
                <img src={photo} alt="product" style={{width: 50, height: 50, objectFit: 'cover'}}/>
            ) : '-'
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Button type="link" onClick={() => showDetails(record, 'product')}>
                    Подробнее
                </Button>
            )
        }
    ];

    // Данные для графиков
    const userChartData = [
        {name: 'Сегодня', value: userStats.today},
        {name: '7 дней', value: userStats.week},
        {name: 'Месяц', value: userStats.month},
        {name: 'Год', value: userStats.year}
    ];

    const orderChartData = [
        {name: 'Сегодня', value: orderStats.today},
        {name: '7 дней', value: orderStats.week},
        {name: 'Месяц', value: orderStats.month},
        {name: 'Год', value: orderStats.year}
    ];

    const paymentChartData = [
        {name: 'Сегодня', value: paymentStats.today},
        {name: '7 дней', value: paymentStats.week},
        {name: 'Месяц', value: paymentStats.month},
        {name: 'Год', value: paymentStats.year}
    ];

    const productChartData = [
        {name: 'Сегодня', value: productStats.today},
        {name: '7 дней', value: productStats.week},
        {name: 'Месяц', value: productStats.month},
        {name: 'Год', value: productStats.year}
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div style={{display: 'flex', minHeight: '100vh'}}>
            {/* Левое меню */}
            <div style={{
                width: 250,
                background: '#001529',
                color: 'white',
                padding: '20px 0'
            }}>
                <h2 style={{color: 'white', padding: '0 20px 20px', borderBottom: '1px solid #1890ff'}}>
                    Админ-панель
                </h2>
                <div style={{padding: '10px 0'}}>
                    <div
                        onClick={() => setActiveTab('1')}
                        style={{
                            padding: '12px 20px',
                            cursor: 'pointer',
                            background: activeTab === '1' ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <UserOutlined/>
                        <span>Пользователи</span>
                    </div>
                    <div
                        onClick={() => setActiveTab('2')}
                        style={{
                            padding: '12px 20px',
                            cursor: 'pointer',
                            background: activeTab === '2' ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <ShoppingCartOutlined/>
                        <span>Заказы</span>
                    </div>
                    <div
                        onClick={() => setActiveTab('3')}
                        style={{
                            padding: '12px 20px',
                            cursor: 'pointer',
                            background: activeTab === '3' ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <DollarOutlined/>
                        <span>Покупки</span>
                    </div>
                    <div
                        onClick={() => setActiveTab('4')}
                        style={{
                            padding: '12px 20px',
                            cursor: 'pointer',
                            background: activeTab === '4' ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <ProductOutlined/>
                        <span>Продукты</span>
                    </div>

                    <div
                        onClick={() => setActiveTab('5')}
                        style={{
                            padding: '12px 20px',
                            cursor: 'pointer',
                            background: activeTab === '5' ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <CalculatorFilled/>
                        <span>Категории</span>
                    </div>

                    <div
                        onClick={() => setActiveTab('6')}
                        style={{
                            padding: '12px 20px',
                            cursor: 'pointer',
                            background: activeTab === '6' ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}
                    >
                        <HeatMapOutlined/>
                        <span>Адреса</span>
                    </div>
                </div>
            </div>

            {/* Основной контент */}
            <div style={{flex: 1, padding: 24, background: '#f0f2f5'}}>
                {activeTab === '1' && (
                    <div>
                        <h2>Пользователи</h2>
                        <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="Сегодня" value={userStats.today}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За 7 дней" value={userStats.week}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За месяц" value={userStats.month}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За год" value={userStats.year}/>
                                </Card>
                            </Col>
                        </Row>

                        <div style={{background: 'white', padding: 24, marginBottom: 24, borderRadius: 8}}>
                            <h3>Статистика новых пользователей</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={userChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {userChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                    <Tooltip/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <h3>Список пользователей</h3>
                            <Table
                                dataSource={users}
                                columns={userColumns}
                                loading={usersLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}

                {activeTab === '2' && (
                    <div>
                        <h2>Заказы</h2>
                        <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="Сегодня" value={orderStats.today}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За 7 дней" value={orderStats.week}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За месяц" value={orderStats.month}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За год" value={orderStats.year}/>
                                </Card>
                            </Col>
                        </Row>

                        <div style={{background: 'white', padding: 24, marginBottom: 24, borderRadius: 8}}>
                            <h3>Статистика заказов</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={orderChartData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Legend/>
                                    <Bar dataKey="value" fill="#8884d8"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <h3>Список заказов</h3>
                            <Table
                                dataSource={orders}
                                columns={orderColumns}
                                loading={ordersLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}

                {activeTab === '3' && (
                    <div>
                        <h2>Покупки</h2>
                        <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="Сегодня"
                                        value={paymentStats.today}
                                        prefix="₽"
                                        valueStyle={{color: '#3f8600'}}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="За 7 дней"
                                        value={paymentStats.week}
                                        prefix="₽"
                                        valueStyle={{color: '#3f8600'}}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="За месяц"
                                        value={paymentStats.month}
                                        prefix="₽"
                                        valueStyle={{color: '#3f8600'}}
                                    />
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic
                                        title="За год"
                                        value={paymentStats.year}
                                        prefix="₽"
                                        valueStyle={{color: '#3f8600'}}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <div style={{background: 'white', padding: 24, marginBottom: 24, borderRadius: 8}}>
                            <h3>Статистика платежей</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={paymentChartData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8"/>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <h3>Список платежей</h3>
                            <Table
                                dataSource={payments}
                                columns={paymentColumns}
                                loading={paymentsLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}

                {activeTab === '4' && (
                    <div>
                        <h2>Продукты</h2>

                        <div style={{marginBottom: 24}}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined/>}
                                onClick={() => setAddProductModal(true)}
                            >
                                Добавить продукт
                            </Button>
                        </div>

                        <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="Сегодня" value={productStats.today}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За 7 дней" value={productStats.week}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За месяц" value={productStats.month}/>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card>
                                    <Statistic title="За год" value={productStats.year}/>
                                </Card>
                            </Col>
                        </Row>

                        <div style={{background: 'white', padding: 24, marginBottom: 24, borderRadius: 8}}>
                            <h3>Статистика продуктов</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={productChartData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Legend/>
                                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{r: 8}}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <h3>Список продуктов</h3>
                            <Table
                                dataSource={products}
                                columns={productColumns}
                                loading={productsLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}

                {activeTab === '5' && (
                    <div>
                        <h2>Категории</h2>

                        {/*<div style={{marginBottom: 24}}>*/}
                        {/*    <Button*/}
                        {/*        type="primary"*/}
                        {/*        icon={<PlusOutlined/>}*/}
                        {/*        onClick={() => setAddProductModal(true)}*/}
                        {/*    >*/}
                        {/*        Добавить продукт*/}
                        {/*    </Button>*/}
                        {/*</div>*/}


                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <Table
                                dataSource={categories}
                                columns={categoriesColumns}
                                loading={productsLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}

                {activeTab === '6' && (
                    <div>
                        <h2>Адреса</h2>

                        <div style={{background: 'white', padding: 24, borderRadius: 8}}>
                            <Table
                                dataSource={addresses}
                                columns={addressesColumns}
                                loading={productsLoading}
                                rowKey="id"
                                pagination={{pageSize: 10}}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Модальное окно добавления продукта */}
            <Modal
                title="Добавить продукт"
                open={addProductModal}
                onCancel={() => setAddProductModal(false)}
                onOk={() => productForm.submit()}
                width={700}
            >
                <Form
                    form={productForm}
                    layout="vertical"
                    onFinish={handleAddProduct}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Название"
                                rules={[{required: true, message: 'Введите название'}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Цена"
                                rules={[{required: true, message: 'Введите цену'}]}
                            >
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="content" label="Описание">
                        <TextArea rows={3}/>
                    </Form.Item>

                    <Form.Item name="composition" label="Состав">
                        <TextArea rows={3}/>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="count" label="Количество">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="grams" label="Вес (г)">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="category_id" label="ID категории">
                                <InputNumber style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="protein" label="Белки">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="fats" label="Жиры">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="carbohydrates" label="Углеводы">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="kilocalorie" label="Калории">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="discount_price" label="Цена со скидкой">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="discount" label="Скидка (%)">
                                <InputNumber min={0} max={100} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="quantity" label="Количество для скидки">
                                <InputNumber min={0} style={{width: '100%'}}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Фото">
                        <Upload
                            beforeUpload={handleUploadPhoto}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined/>} loading={uploadingPhoto}>
                                Загрузить фото
                            </Button>
                        </Upload>
                        {photoUrl && (
                            <div style={{marginTop: 16}}>
                                <img
                                    src={photoUrl}
                                    alt="Preview"
                                    style={{maxWidth: 200, maxHeight: 200, objectFit: 'cover'}}
                                />
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </Modal>

            {/* Модальное окно деталей */}
            <Modal
                title={`Детали ${detailType === 'user' ? 'пользователя' :
                    detailType === 'order' ? 'заказа' :
                        detailType === 'payment' ? 'платежа' : 'продукта'}`}
                open={detailModal}
                onCancel={() => setDetailModal(false)}
                footer={null}
                width={600}
            >
                {detailData && (
                    <pre style={{background: '#f5f5f5', padding: 16, borderRadius: 8}}>
                        {JSON.stringify(detailData, null, 2)}
                    </pre>
                )}
            </Modal>
        </div>
    );
}

export default Admin;