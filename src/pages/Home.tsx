import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const {isAuthenticated, isLoading} = useAuth();


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="text-muted-foreground text-lg">Загрузка...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-xl p-8 shadow-lg border rounded-2xl">
        <CardContent className="flex flex-col items-center gap-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
            Добро пожаловать на сайт обмена книгами!
          </h1>
          <p className="text-lg text-muted-foreground text-center">
            Делитесь книгами и знакомьтесь с другими читателями!
          </p>

          {isAuthenticated ? (
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-4">
              <Button
                onClick={() => navigate('/books/add')}
                size="lg"
              >
                Добавить книгу
              </Button>
              <Button
                onClick={() => navigate('/books')}
                variant="outline"
                size="lg"
              >
                Посмотреть книги других пользователей
              </Button>
            </div>
          ) : (
            <div className="mt-6 text-center text-base">
              <span>Пожалуйста, </span>
              <Button
                variant="link"
                className="p-0 h-auto align-baseline hover:pointer"
                onClick={() => navigate('/login')}
              >
                войдите
              </Button>
              <span> или </span>
              <Button
                variant="link"
                className="p-0 h-auto align-baseline hover:pointer"
                onClick={() => navigate('/register')}
              >
                зарегистрируйтесь
              </Button>
              <span>, чтобы начать обмен книгами.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
