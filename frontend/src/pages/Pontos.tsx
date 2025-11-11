import { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Gift, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/layout/Navbar';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Historico {
  id: string;
  tipo: 'ganho' | 'consumo';
  descricao: string;
  pontos: number;
  data: string;
}

interface PontosData {
  pontos: number;
  pontosConsumidos: number;
  historico: Historico[];
  mensagem?: string;
}

const Pontos = () => {
  const [data, setData] = useState<PontosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [consumindo, setConsumindo] = useState(false);
  const [pontosConsumir, setPontosConsumir] = useState('');
  const { toast } = useToast();

  const fetchPontos = async () => {
    try {
      const response = await api.get('/pontos');
      setData(response.data);
      
      if (response.data.mensagem) {
        toast({
          title: 'Novidade!',
          description: response.data.mensagem,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar pontos',
        description: 'Não foi possível carregar seus dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPontos();
  }, []);

  const handleConsumirPontos = async () => {
    const pontos = parseInt(pontosConsumir);
    
    if (!pontos || pontos <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Digite um valor válido de pontos',
        variant: 'destructive',
      });
      return;
    }

    if (data && pontos > data.pontos) {
      toast({
        title: 'Pontos insuficientes',
        description: `Você possui apenas ${data.pontos} pontos disponíveis`,
        variant: 'destructive',
      });
      return;
    }

    setConsumindo(true);
    try {
      await api.post('/consumir', { pontos });
      toast({
        title: 'Sucesso!',
        description: `${pontos} pontos consumidos com sucesso`,
      });
      setPontosConsumir('');
      await fetchPontos();
    } catch (error: any) {
      toast({
        title: 'Erro ao consumir pontos',
        description: error.response?.data?.message || 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setConsumindo(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pontos</h1>
          <p className="text-muted-foreground">
            Acompanhe seus pontos de engajamento e histórico de transações
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos Disponíveis</CardTitle>
              <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{data?.pontos || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Utilize para obter descontos
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {(data?.pontos || 0) + (data?.pontosConsumidos || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pontos acumulados no total
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos Consumidos</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{data?.pontosConsumidos || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total utilizado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Card para consumir pontos */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Consumir Pontos
            </CardTitle>
            <CardDescription>
              Use seus pontos para obter descontos e benefícios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="pontos">Quantidade de pontos</Label>
                <Input
                  id="pontos"
                  type="number"
                  placeholder="Digite a quantidade"
                  value={pontosConsumir}
                  onChange={(e) => setPontosConsumir(e.target.value)}
                  min="1"
                  max={data?.pontos || 0}
                />
              </div>
              <Button
                onClick={handleConsumirPontos}
                disabled={consumindo || !pontosConsumir}
                className="bg-gradient-primary"
              >
                {consumindo ? 'Processando...' : 'Aplicar Desconto'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Histórico de Engajamento
            </CardTitle>
            <CardDescription>
              Todas as suas transações de pontos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.historico.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(item.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{item.descricao}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.tipo === 'ganho'
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {item.tipo === 'ganho' ? 'Ganho' : 'Consumo'}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        item.pontos > 0 ? 'text-success' : 'text-muted-foreground'
                      }`}
                    >
                      {item.pontos > 0 ? '+' : ''}{item.pontos}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Pontos;
