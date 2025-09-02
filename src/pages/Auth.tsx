import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Loader2, LogIn, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function Auth() {
  // Separate states for login and signup
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Clear form data when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setErrors({});
    setSignupSuccess(false);
    setCaptchaToken(null);
    if (captchaRef.current) {
      captchaRef.current.resetCaptcha();
    }
  };

  // Translate Supabase errors to Portuguese
  const translateError = (error: any): string => {
    if (!error) return '';
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('invalid login credentials') || message.includes('email not confirmed')) {
      return 'Email ou senha incorretos. Verifique se confirmou seu email.';
    }
    if (message.includes('user already registered')) {
      return 'Este email já está cadastrado. Tente fazer login.';
    }
    if (message.includes('email rate limit exceeded')) {
      return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
    }
    if (message.includes('password should be at least')) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (message.includes('signup is disabled')) {
      return 'Cadastro temporariamente desabilitado.';
    }
    if (message.includes('invalid email')) {
      return 'Email inválido. Verifique o formato.';
    }
    
    return 'Erro inesperado. Tente novamente.';
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 6) {
      return { isValid: false, message: 'Mínimo de 6 caracteres' };
    }
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: true, message: 'Senha forte' };
    }
    if (password.length >= 6) {
      return { isValid: true, message: 'Senha adequada' };
    }
    return { isValid: false, message: 'Senha muito fraca' };
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    // Validate inputs
    const newErrors: { [key: string]: string } = {};
    
    if (!loginData.email) {
      newErrors.loginEmail = 'Email é obrigatório';
    } else if (!validateEmail(loginData.email)) {
      newErrors.loginEmail = 'Email inválido';
    }
    
    if (!loginData.password) {
      newErrors.loginPassword = 'Senha é obrigatória';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      setErrors({ general: translateError(error) });
    } else {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSignupSuccess(false);
    
    // Validate inputs
    const newErrors: { [key: string]: string } = {};
    
    if (!signupData.email) {
      newErrors.signupEmail = 'Email é obrigatório';
    } else if (!validateEmail(signupData.email)) {
      newErrors.signupEmail = 'Email inválido';
    }
    
    if (!signupData.password) {
      newErrors.signupPassword = 'Senha é obrigatória';
    } else {
      const passwordValidation = validatePassword(signupData.password);
      if (!passwordValidation.isValid) {
        newErrors.signupPassword = passwordValidation.message;
      }
    }

    if (!captchaToken) {
      newErrors.captcha = 'Por favor, complete a verificação de segurança';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    
    const { error } = await signUp(signupData.email, signupData.password, captchaToken);
    
    if (error) {
      setErrors({ general: translateError(error) });
      // Reset captcha on error
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
      setCaptchaToken(null);
    } else {
      setSignupSuccess(true);
      setSignupData({ email: '', password: '' });
      setCaptchaToken(null);
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 gradient-blue rounded-xl flex items-center justify-center mx-auto shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Sistema de Validade
          </h1>
          <p className="text-muted-foreground">
            Controle inteligente de produtos
          </p>
        </div>

        {/* Auth Forms */}
        <Card className="gradient-border">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* General Error Display */}
            {errors.general && (
              <Alert className="mb-4 border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Success Message */}
            {signupSuccess && (
              <Alert className="mb-4 border-green-500/50 bg-green-50 dark:bg-green-950/50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Conta criada com sucesso! Verifique seu email para ativar a conta.
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      disabled={isLoading}
                      className={errors.loginEmail ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.loginEmail && (
                      <p className="text-sm text-destructive">{errors.loginEmail}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        disabled={isLoading}
                        className={`pr-10 ${errors.loginPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        disabled={isLoading}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.loginPassword && (
                      <p className="text-sm text-destructive">{errors.loginPassword}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar no Sistema
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      disabled={isLoading}
                      className={errors.signupEmail ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {errors.signupEmail && (
                      <p className="text-sm text-destructive">{errors.signupEmail}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Crie uma senha segura"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                        disabled={isLoading}
                        minLength={6}
                        className={`pr-10 ${errors.signupPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        disabled={isLoading}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.signupPassword && (
                      <p className="text-sm text-destructive">{errors.signupPassword}</p>
                    )}
                    {signupData.password && (
                      <div className="text-xs text-muted-foreground">
                        {validatePassword(signupData.password).message}
                      </div>
                    )}
                  </div>
                  
                  {/* hCaptcha */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Verificação de Segurança</span>
                    </Label>
                    <div className="flex justify-center">
                      <HCaptcha
                        ref={captchaRef}
                        sitekey="10000000-ffff-ffff-ffff-000000000001" // Chave de teste do hCaptcha
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                        onError={() => setCaptchaToken(null)}
                      />
                    </div>
                    {errors.captcha && (
                      <p className="text-sm text-destructive text-center">{errors.captcha}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !captchaToken}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Conta
                  </Button>
                </form>
                
                <div className="text-sm text-muted-foreground text-center mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
                  <p>💡 <strong>Dica:</strong> Após o cadastro, você receberá um email de confirmação.</p>
                  <p>🛡️ <strong>Segurança:</strong> Complete a verificação acima para criar sua conta.</p>
                  <p className="text-xs">Para testes rápidos, você pode desabilitar a confirmação de email nas configurações do Supabase.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          © 2024 Sistema de Validade - Versão 2.0
        </p>
      </div>
    </div>
  );
}
